/**
 * Questionário para alunos do ensino médio integrado ao técnico, respondido
 * logo após uma demonstração da plataforma (sem uso direto). É independente
 * de qualquer outro formulário do projeto: tem configuração, título e planilha
 * de respostas próprios.
 *
 * Como usar:
 *   1. Abra https://script.google.com, crie um projeto novo e cole este arquivo.
 *   2. Preencha o objeto CONFIG_TECNICO. Enquanto houver campo entre colchetes, o
 *      formulário é criado com "[RASCUNHO]" no título.
 *   3. Execute criarFormularioAlunosTecnico() e autorize o acesso ao Google Forms e
 *      ao Google Sheets. Os links aparecem no registro de execução.
 *
 * O formulário não coleta e-mail, nome nem outro identificador, e pede a
 * idade em faixas. Tempo estimado de resposta: 4 a 5 minutos.
 */

const CONFIG_TECNICO = {
  TITULO: 'Opinião sobre a demonstração do Interpretador Dinâmico',
  AUTORES: 'Victor Vilela e Igor Lamoia',
  CURSO_GRADUACAO: '[CURSO DE GRADUAÇÃO DOS AUTORES]',
  ORIENTADOR: '[NOME DO(A) ORIENTADOR(A)]',
  INSTITUICAO: 'CEFET-MG',
  CONTATO: '[E-MAIL PARA DÚVIDAS]',
  SITUACAO_ETICA: '[SITUAÇÃO NO COMITÊ DE ÉTICA OU ENQUADRAMENTO ADOTADO]',
  CURSOS_TECNICOS: ['Informática', 'Eletrônica', 'Mecatrônica', 'Outro curso técnico'],
  ANOS: ['1º ano', '2º ano', '3º ano', '4º ano'],
  CRIAR_PLANILHA: true,
};

const ESCALA_TECNICO = [
  'Discordo totalmente',
  'Discordo',
  'Não concordo nem discordo',
  'Concordo',
  'Concordo totalmente',
];

const AFIRMACOES_TECNICO = [
  'Entendi para que serve a plataforma.',
  'Um programa escrito com palavras em português é mais fácil de entender do que um escrito com palavras em inglês.',
  'Poder escolher as palavras da linguagem ajudaria quem está começando a programar.',
  'Ver como a plataforma separa o programa em partes (os tokens) ajuda a entender como o computador lê o código.',
  'Eu gostaria de usar essa plataforma nas aulas de programação.',
  'A demonstração aumentou meu interesse em aprender programação.',
];

const VERSAO_A_TECNICO = [
  'int n;',
  'scan(int, n);',
  'if (n % 2 == 0) {',
  '  print("PAR");',
  '} else {',
  '  print("IMPAR");',
  '}',
].join('\n');

const VERSAO_B_TECNICO = [
  'numero_inteiro n;',
  'leia(numero_inteiro, n);',
  'se (n % 2 igual 0) inicio',
  '  escreva("PAR");',
  'fim senao inicio',
  '  escreva("IMPAR");',
  'fim',
].join('\n');

function emRascunhoTecnico_() {
  return Object.keys(CONFIG_TECNICO).some(function (chave) {
    const valor = CONFIG_TECNICO[chave];
    return typeof valor === 'string' && /\[[^\]]+\]/.test(valor);
  });
}

function textoAssentimentoTecnico_() {
  return [
    'Você está sendo convidado(a) a responder um questionário sobre a demonstração que acabou de assistir. A plataforma faz parte do Trabalho de Conclusão de Curso de ' +
      CONFIG_TECNICO.AUTORES + ', do curso de ' + CONFIG_TECNICO.CURSO_GRADUACAO + ' do ' + CONFIG_TECNICO.INSTITUICAO +
      ', com orientação de ' + CONFIG_TECNICO.ORIENTADOR + '.',
    '',
    '• Responder leva cerca de 5 minutos.',
    '• Participar é voluntário. Você pode deixar de responder ou parar a qualquer momento, sem nenhum prejuízo, inclusive em notas ou na relação com a escola.',
    '• O questionário não pede nome, e-mail nem dado que identifique você. Não escreva seu nome nas respostas abertas.',
    '• As respostas serão analisadas em conjunto e usadas apenas no TCC e em trabalhos acadêmicos que derivem dele.',
    '• O único incômodo previsto é o tempo gasto para responder.',
    '',
    'Dúvidas: ' + CONFIG_TECNICO.CONTATO + '.',
    'Situação ética: ' + CONFIG_TECNICO.SITUACAO_ETICA + '.',
  ].join('\n');
}

function criarFormularioAlunosTecnico() {
  const titulo = (emRascunhoTecnico_() ? '[RASCUNHO] ' : '') + CONFIG_TECNICO.TITULO;
  const form = FormApp.create(titulo);
  form
    .setDescription('Questionário anônimo sobre a demonstração de uma plataforma que permite escolher as palavras de uma linguagem de programação.')
    .setCollectEmail(false)
    .setAllowResponseEdits(false)
    .setShowLinkToRespondAgain(false)
    .setProgressBar(true)
    .setConfirmationMessage('Obrigado por responder! Suas respostas foram registradas sem identificação.');

  // Termo de assentimento: quem não concorda vai direto para o envio, sem responder nada.
  const termo = form.addMultipleChoiceItem()
    .setTitle('Termo de assentimento')
    .setHelpText(textoAssentimentoTecnico_())
    .setRequired(true);
  termo.setChoices([
    termo.createChoice('Li e quero participar', FormApp.PageNavigationType.CONTINUE),
    termo.createChoice('Não quero participar', FormApp.PageNavigationType.SUBMIT),
  ]);

  form.addPageBreakItem()
    .setTitle('Sobre você')
    .setHelpText('Estas perguntas servem para comparar grupos. Nenhuma delas identifica você.');

  form.addMultipleChoiceItem()
    .setTitle('Qual é a sua idade?')
    .setChoiceValues(['Até 15 anos', '16 ou 17 anos', '18 anos ou mais'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Qual é o seu curso técnico?')
    .setChoiceValues(CONFIG_TECNICO.CURSOS_TECNICOS)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Em que ano você está?')
    .setChoiceValues(CONFIG_TECNICO.ANOS)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Você já programou antes?')
    .setChoiceValues([
      'Nunca programei',
      'Já programei um pouco (em aulas, cursos ou tutoriais)',
      'Programo com frequência',
    ])
    .setRequired(true);

  form.addPageBreakItem()
    .setTitle('Sobre a demonstração')
    .setHelpText('Marque o quanto você concorda com cada frase. Não existe resposta certa ou errada.');

  form.addGridItem()
    .setTitle('O quanto você concorda com cada frase?')
    .setRows(AFIRMACOES_TECNICO)
    .setColumns(ESCALA_TECNICO)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('As duas versões abaixo fazem a mesma coisa: leem um número e escrevem se ele é par ou ímpar. Qual delas você acha mais fácil de entender?')
    .setHelpText('Versão A:\n' + VERSAO_A_TECNICO + '\n\nVersão B:\n' + VERSAO_B_TECNICO)
    .setChoiceValues([
      'Versão A',
      'Versão B',
      'As duas são igualmente fáceis',
      'As duas são igualmente difíceis',
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Quer comentar algo? O que você mudaria ou acrescentaria na plataforma?')
    .setHelpText('Opcional. Não escreva seu nome nem informações que identifiquem você.')
    .setRequired(false);

  if (CONFIG_TECNICO.CRIAR_PLANILHA) {
    const planilha = SpreadsheetApp.create('Respostas: ' + titulo);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, planilha.getId());
    Logger.log('Planilha de respostas: ' + planilha.getUrl());
  }

  Logger.log('Link para responder: ' + form.getPublishedUrl());
  Logger.log('Link para editar: ' + form.getEditUrl());
  if (emRascunhoTecnico_()) {
    Logger.log('Atenção: há campos entre colchetes em CONFIG_TECNICO. O formulário foi criado como rascunho.');
  }
}
