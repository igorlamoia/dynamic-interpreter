# Verificação do back-end e do compilador — 19/09/2026

Base examinada: `e0a012bb833fa829e6e694bc2f5b99fdff4863a0`, branch
`escrita-tcc`. Esta atualização altera o TCC e seus registros; o código da
aplicação foi inspecionado e testado, sem modificações.

## Execução local

- Back-end: **188 casos aprovados em 17 arquivos**, sem falhas, erros ou
  ignorados; 59,07 segundos.
- Compilador: **224 casos aprovados em 21 arquivos**, sem falhas.
- [Registro estruturado](testes-backend-2026-09-19.json): versões, comandos,
  casos por arquivo e limites da execução.

Os testes Python usam SQLite em memória, HTTPX com transporte ASGI e
substituição da dependência de sessão. Não acessam a implantação pública.
As tabelas são criadas pelos modelos; as migrações Alembic, o PostgreSQL e
as transações da dependência de produção não são validados por essa suíte.
Não foi medida cobertura percentual. O workflow foi inspecionado, sem
executar os jobs remotos nesta revisão.

Comandos-base, a partir da raiz:

```sh
(cd backend && uv run --frozen pytest -q)
(cd packages/compiler && npx vitest run)
```

## Correspondência entre texto e código

| Assunto | Evidência no repositório |
| --- | --- |
| Preparação e isolamento transacional | `backend/tests/conftest.py`, `factories.py` e `backend/pyproject.toml` |
| Usuário sem senha na resposta | `backend/app/schemas/users.py`, `schemas/auth.py` e `backend/tests/test_auth.py` |
| Resumo de linguagens | `backend/app/schemas/languages.py` e `backend/tests/test_languages_presentation.py` |
| Histórico próprio sem código | `backend/app/modules/exercises/router.py`, `service.py`, `schemas/exercises.py` e `backend/tests/test_exercise_own_submissions.py` |
| Resumo de turmas | `backend/app/schemas/classes.py`, `modules/classes/service.py` e `backend/tests/test_classes.py` |
| Hash de senha, JWT e perfis | `backend/app/core/security.py`, `dependencies.py` e `schemas/auth.py` |
| Paginação e suas limitações | `backend/app/modules/languages/router.py`, `modules/submissions/service.py` e `backend/tests/test_pagination.py` |
| Testes como condição de deploy | `.github/workflows/deploy.yml` |

O texto diferencia seleção dos registros autorizados, seleção das propriedades
retornadas e validação/tratamento do conteúdo. Os exemplos não demonstram que
todos os endpoints tenham respostas mínimas ou autorização completa.

## Limitações constatadas por inspeção

- A leitura de usuário por identificador autentica o solicitante, mas o serviço
  de consulta não compara seu vínculo ou organização com o usuário solicitado.
- A leitura individual de submissão restringe a propriedade para o aluno; a
  atribuição de nota rejeita esse perfil, mas nesse caminho não há conferência
  do vínculo do professor com a atividade. A listagem tem filtros adicionais,
  que não substituem essa verificação no acesso individual.
- O cadastro público permite selecionar professor; isso não comprova vínculo
  institucional. O TCC não afirma que essa identidade tenha sido verificada.
- Há caminhos sem paginação obrigatória, e a paginação de submissões recorta
  em memória uma coleção previamente consultada.
- O código usa bcrypt. O referencial registra a recomendação atual da OWASP
  por Argon2id para novos sistemas, sem alegar que a migração já ocorreu.

Esses pontos foram documentados como limites e encaminhamentos. Esta revisão
não realizou teste de intrusão nem certifica a segurança da implantação.

## Fontes consultadas

As entradas bibliográficas do TCC incluem as páginas oficiais sobre
[fixtures do pytest](https://docs.pytest.org/en/stable/how-to/fixtures.html),
[pytest-asyncio](https://pytest-asyncio.readthedocs.io/en/stable/concepts.html),
[testes assíncronos](https://fastapi.tiangolo.com/advanced/async-tests/),
[substituição de dependências](https://fastapi.tiangolo.com/advanced/testing-dependencies/),
[modelos de resposta](https://fastapi.tiangolo.com/tutorial/response-model/) e
[dependências com yield](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/).

A fundamentação de segurança utiliza a OWASP: autorização por objeto e
propriedade, consumo de recursos, validação de entrada, armazenamento de
senhas, autorização e segurança REST. As URLs completas e a data de acesso
(19/09/2026) constam em `../referencias.bib`. A descrição da implementação
cita URLs do repositório fixadas no commit examinado.
