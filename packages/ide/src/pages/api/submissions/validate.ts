import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { Lexer } from '@ts-compilator-for-java/compiler/src/lexer'
import type {
    BooleanLiteralMap,
    KeywordMap,
    LexerBlockDelimiters,
    OperatorWordMap,
} from '@ts-compilator-for-java/compiler/src/lexer/config'
import { TokenIterator } from '@ts-compilator-for-java/compiler/token/TokenIterator'
import { IssueError } from '@ts-compilator-for-java/compiler/issue'
import { Interpreter } from '@ts-compilator-for-java/compiler/interpreter'
import type { Instruction } from '@ts-compilator-for-java/compiler/interpreter/constants'
import { buildEffectiveKeywordMap } from '@/lib/keyword-map'
import { normalizeCompilerConfig } from '../../../lib/compiler-config'
import type { IDEGrammarConfig } from '@/entities/compiler-config'
import type { TTestCaseResult, TValidationResult } from '@/types/submissions'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function runTestCase(
    instructions: Instruction[],
    input: string,
    timeoutMs = 5000
): Promise<{ output: string; error: string | null }> {
    const inputLines = input.split('\n')
    let inputIndex = 0
    let output = ''

    const interpreter = new Interpreter(
        instructions,
        {
            stdout: (msg: string) => {
                output += msg
            },
            stdin: async () => {
                if (inputIndex < inputLines.length) {
                    return inputLines[inputIndex++]
                }
                return ''
            },
        }
    )

    try {
        await Promise.race([
            interpreter.execute(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
            ),
        ])
        return { output, error: null }
    } catch (err) {
        if (err instanceof Error && err.message === 'TIMEOUT') {
            return { output, error: 'Tempo limite excedido (5s)' }
        }
        return { output, error: (err as Error).message }
    }
}

function normalizeOutput(s: string): string {
    return s.replace(/\r\n/g, '\n').trimEnd()
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<TValidationResult>) {
    if (req.method !== 'POST') return res.status(405).json({ valid: false, errors: ['Metodo nao permitido'], warnings: [] })

    const userId = req.headers['x-user-id'] as string
    const jwtToken = req.headers['x-authorization'] as string | undefined
    if (!userId) return res.status(401).json({ valid: false, errors: ['Não autorizado'], warnings: [] })

    const { exerciseId, exerciseListId, classId, sourceCode, keywordMap, operatorWordMap, booleanLiteralMap, statementTerminatorLexeme, blockDelimiters, indentationBlock, grammar, locale } = req.body as {
        exerciseId: string
        exerciseListId: string
        classId: string
        sourceCode: string
        keywordMap?: KeywordMap
        operatorWordMap?: OperatorWordMap
        booleanLiteralMap?: BooleanLiteralMap
        statementTerminatorLexeme?: string
        blockDelimiters?: LexerBlockDelimiters
        indentationBlock?: boolean
        grammar?: Partial<IDEGrammarConfig>
        locale?: string
    }
    const dryRun = req.query.dryRun === 'true'

    if (!exerciseId || !sourceCode) {
        return res.status(400).json({ valid: false, errors: ['Código e exercício são obrigatórios'], warnings: [] })
    }

    if (!dryRun && (!exerciseListId || !classId)) {
        return res.status(400).json({ valid: false, errors: ['exerciseListId e classId são obrigatórios para submissão'], warnings: [] })
    }

    const errors: string[] = []
    const warnings: string[] = []
    let instructions: Instruction[] | null = null

    // Step 1: Lexical Analysis
    try {
        const normalized = normalizeCompilerConfig({
            keywordMap,
            operatorWordMap,
            booleanLiteralMap,
            statementTerminatorLexeme,
            blockDelimiters,
            indentationBlock,
            grammar,
        })
        const effectiveKeywordMap = buildEffectiveKeywordMap(normalized.keywordMap)
        const lexer = new Lexer(sourceCode, {
            customKeywords: effectiveKeywordMap,
            operatorWordMap: normalized.operatorWordMap,
            booleanLiteralMap: normalized.booleanLiteralMap,
            statementTerminatorLexeme: normalized.statementTerminatorLexeme,
            blockDelimiters: normalized.blockDelimiters,
            indentationBlock: normalized.indentationBlock,
        })
        const tokens = lexer.scanTokens()

        if (lexer.warnings.length > 0) {
            lexer.warnings.forEach(w => warnings.push(`Aviso (linha ${w.line}): ${w.message}`))
        }

        // Step 2: Intermediate Code Generation (Syntax + Semantic)
        try {
            const iterator = new TokenIterator(tokens, {
                locale,
                grammar: normalized.grammar,
                statementTerminatorLexeme: normalized.statementTerminatorLexeme,
            })
            instructions = iterator.generateIntermediateCode()
        } catch (error) {
            if (error instanceof IssueError) {
                errors.push(`Erro de compilação (linha ${error.details.line}): ${error.details.message}`)
            } else {
                errors.push(`Erro de compilação: ${(error as Error).message}`)
            }
        }
    } catch (error) {
        if (error instanceof IssueError) {
            errors.push(`Erro léxico (linha ${error.details.line}): ${error.details.message}`)
        } else {
            errors.push(`Erro léxico: ${(error as Error).message}`)
        }
    }

    // If there are compilation errors, return them without saving
    if (errors.length > 0) {
        return res.status(200).json({ valid: false, errors, warnings })
    }

    // Step 3: Run test cases if they exist
    let testCaseResults: TTestCaseResult[] | undefined
    let testCasesPassed: number | undefined
    let testCasesTotal: number | undefined

    if (instructions) {
        try {
            const exerciseRes = await axios.get(
                `${BACKEND_URL}/exercises/${exerciseId}`,
                { headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {} }
            )
            const testCases: Array<{ label: string; input: string; expectedOutput: string; orderIndex: number }> =
                exerciseRes.data?.testCases ?? []

            if (testCases.length > 0) {
                const sorted = [...testCases].sort((a, b) => a.orderIndex - b.orderIndex)
                testCaseResults = []
                testCasesTotal = sorted.length
                testCasesPassed = 0

                for (const tc of sorted) {
                    const { output, error } = await runTestCase(instructions, tc.input)

                    const actualOutput = error
                        ? `[Erro] ${error}`
                        : normalizeOutput(output)
                    const expectedNormalized = normalizeOutput(tc.expectedOutput)
                    const passed = !error && actualOutput === expectedNormalized

                    if (passed) testCasesPassed++

                    testCaseResults.push({
                        label: tc.label || `Caso ${tc.orderIndex + 1}`,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: error ? `[Erro] ${error}` : output,
                        passed,
                    })
                }
            }
        } catch {
            // If fetching test cases fails, proceed without them
        }
    }

    // Step 4: Create the submission (unless dryRun)
    if (dryRun) {
        return res.status(200).json({
            valid: true,
            errors: [],
            warnings,
            testCaseResults,
            testCasesPassed,
            testCasesTotal,
        })
    }

    try {
        const submissionRes = await axios.post(
            `${BACKEND_URL}/submissions`,
            {
                exerciseId: Number(exerciseId),
                exerciseListId: Number(exerciseListId),
                classId: Number(classId),
                codeSnapshot: sourceCode,
                // The customization the IDE actually used. Backend overrides this
                // with the locked language when exercise.policy === LOCKED.
                languageSnapshot: {
                    keywordMap: keywordMap ?? {},
                    operatorWordMap: operatorWordMap ?? {},
                    booleanLiteralMap: booleanLiteralMap ?? {},
                    statementTerminatorLexeme: statementTerminatorLexeme ?? '',
                    blockDelimiters: blockDelimiters ?? null,
                    indentationBlock: indentationBlock ?? false,
                    grammar: grammar ?? {},
                },
                status: 'SUBMITTED',
            },
            {
                headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {},
            }
        )

        return res.status(200).json({
            valid: true,
            errors: [],
            warnings,
            submissionId: String(submissionRes.data.id),
            testCaseResults,
            testCasesPassed,
            testCasesTotal,
        })
    } catch (error) {
        console.error('[validate] Erro ao salvar submissão:', error)
        const msg = axios.isAxiosError(error)
            ? JSON.stringify(error.response?.data) ?? error.message
            : (error as Error).message
        return res.status(500).json({
            valid: false,
            errors: [`Erro ao salvar a submissão: ${msg}`],
            warnings
        })
    }
}
