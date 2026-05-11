%% configcefetmglpd.cls, v-1.0.1 TP
%% 
  %% Copyright 2022 Thiago Paschoalin (DEELP/CEFET-MG). 
  % jul2022: version 1.0.1
  % This work may be distributed and/or modified under the
% conditions of the LaTeX Project Public License, either version 1.3
% of this license or (at your option) any later version.
% The latest version of this license is in
%   http://www.latex-project.org/lppl.txt
%
% This work has the LPPL maintenance status `maintained'.
%   
  % The Current Maintainer of this work is Thiago Paschoalin (DEELP/CEFET-MG).
  %
  % This work consists of the file configcefetmglpd.cls.

%------------------------------------
%------------------------------------

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{configcefetmglpd}[2021/11/18 v1.0]


\DeclareOption*{
  \PassOptionsToClass{\CurrentOption}{memoir}
}
\ProcessOptions\relax
\LoadClass[12pt,a4paper]{memoir}

%------------------------------------

\RequirePackage{ifthen}
\RequirePackage[brazil]{babel}
\RequirePackage{enumitem}
\RequirePackage{calc}



\newcommand{\IfNonempty}[2]{\ifthenelse{\not\equal{#1}{}}{#2}{}} 

\RequirePackage[hypertexnames=false, hidelinks]{hyperref}    

\pdfstringdefDisableCommands{
\def\url{}
\def\cite\@gobble 
\let\textcolor\@gobble
}

\RequirePackage{bookmark}   			


\newcommand{\folhaderostonome}{Folha de rosto}
\newcommand{\dedicatorianome}{Dedicatória}
\newcommand{\agradecimentosnome}{Agradecimentos}
\newcommand{\epigrafenome}{Epígrafe}
\newcommand{\orientadornome}{Orientador:}
\newcommand{\coorientadornome}{Coorientador:}
\newcommand{\folhadeaprovacaonome}{Folha de Aprovação}
\newcommand{\termocompromissonome}{Termo de Responsabilidade}
\newcommand{\resumonome}{Resumo} 
\newcommand{\listadesimbolosnome}{Lista de Símbolos}
\newcommand{\listadesiglasnome}{Lista de Abreviaturas e Siglas}
\newcommand{\anexonome}{ANEXO}
\newcommand{\anexosnome}{Anexos}
\newcommand{\apendicenome}{APÊNDICE}
\newcommand{\apendicesnome}{Apêndices}

%% --
\addto\captionsbrazil{
  \renewcommand{\contentsname}{SUMÁRIO \label{sumario_num}} 
  \renewcommand{\bibname}{REFERÊNCIAS}
  \renewcommand{\indexname}{ÍNDICE}
  \renewcommand{\listfigurename}{LISTA DE ILUSTRAÇÕES}
  \renewcommand{\listtablename}{LISTA DE TABELAS}
  \renewcommand{\figurename}{Figura}
}

%% ----------------------------

\def\au@classname{configcefetmglpd} 

\newif\if@eu@ilhookcalled\@eu@ilhookcalledfalse
\newif\if@eu@hasil\@eu@hasilfalse

\def\au@eu@ilaux{\global\@eu@hasiltrue}
\def\au@eu@ilhook{%
  \if@eu@ilhookcalled\else
    \global\@eu@ilhookcalledtrue
    \global\@eu@hasiltrue
    \immediate\write\@auxout{%
      \string\au@eu@ilaux{}^^J
    }
    \typeout{* \au@classname: Il }%
  \fi
}
\newcommand{\auaddilcmd}[1]{%
  \begingroup
  \let\au@temp#1
  \expandafter\gdef\expandafter#1\expandafter{%
    \expandafter\au@eu@ilhook\au@temp}
  \endgroup
}
\newcommand{\auaddilenv}[1]{%
  \begingroup
  \expandafter\auaddilcmd\expandafter{\csname#1\endcsname}
  \endgroup
}
\AtBeginDocument{\auaddilenv{figure}}

%------------------------------------

\setlrmarginsandblock{3cm}{2cm}{*}
\setulmarginsandblock{3cm}{2cm}{*}
\checkandfixthelayout

\OnehalfSpacing
\AtBeginDocument{\setlength{\afterchapskip}{\onelineskip}} 

\setlength{\parindent}{1.3cm}
\setlength{\parskip}{4pt}
\setlength{\cftbeforechapterskip}{0pt} 

%-----------------------------------

\newcounter{bookmarkcounter} 
\setcounter{bookmarkcounter}{0}
\newcommand{\bookmarkphantom}[1]{%
  \addtocounter{bookmarkcounter}{1}%
  \phantomsection\pdfbookmark[0]{#1}{chapterb\arabic{bookmarkcounter}}
}

\newcommand{\pretextualchapter}[1]{%
  \addtocounter{bookmarkcounter}{1}%
  \bookmarkphantom{#1}
  \chapter*[#1]{#1}
  }
\provideboolean{AppendixAnexo}      
\setboolean{AppendixAnexo}{false}


%------------------------------------

%\renewcommand{\foottextfont}{\small}
\setlength{\footmarkwidth}{1.2em}
\setlength{\footmarksep}{0em}
\footmarkstyle{\footnotesize{\textsuperscript{#1}}\hfill}



 % \counterwithout{figure}{chapter}
 % \counterwithout{table}{chapter}

  \renewcommand{\footnoterule}{% Kerns avoid vertical space
  \kern -3pt                         % This -3 is negative
  \hrule width 5cm height 0.5pt % of the sum of this 1
  \kern 2pt}                         % and this 2

%------------------------------------

\captiondelim{~\textendash ~} 
\captionnamefont{\footnotesize}
\captiontitlefont{\footnotesize}
\indentcaption{0pt} 
\captionstyle[\centering]{\centerlastline} 
\newcommand{\larguratexto}{\changecaptionwidth \captionwidth} 

\newcommand{\configureseparator}{\captiondelim{: }}

\newcommand{\fonte}[2][Fonte]{%
  \M@gettitle{#2}
  \memlegendinfo{#2}
  \par
  \begingroup
  \captionstyle{\raggedright}{\raggedright} 
     \@parboxrestore
     \if@minipage
       \@setminipage
     \fi
     \footnotesize
     \captiondelim{: }
     \@makecaption{\footnotesize 
     #1}{\ignorespaces \footnotesize 
     #2}\par
   \endgroup}

\newcommand{\nota}[2][Nota]{
  \vspace*{-12pt }
  \M@gettitle{#2}
  \memlegendinfo{#2}
  \par
  \begingroup
  \captionstyle{\raggedright}{\raggedright} 
     \@parboxrestore
     \if@minipage
       \@setminipage
     \fi
     \footnotesize
     \captiondelim{: }
     \@makecaption{\footnotesize 
     #1}{\ignorespaces \footnotesize 
     #2}\par
   \endgroup}   


\AtEndPackage{caption}{
  \AtBeginDocument{
    \DeclareCaptionLabelSeparator{dash}{~\textendash ~}
    \DeclareCaptionFont{normalsize}{\normalsize}
      \captionsetup{
                    labelseparator=dash,
                    }
      \renewcommand{\configurecaptions}{
                  \captionsetup{
                                singlelinecheck=false}}
      \renewcommand{\configureseparator}{\captionsetup{labelsep=colon}}
  }
}



%------------------------------------

\setsecnumdepth{paragraph}
\settocdepth{paragraph}
\setcounter{tocdepth}{5}
\setcounter{secnumdepth}{5}
\maxsecnumdepth{paragraph}

\newcommand{\subsubsubsection}{\paragraph}
\newcommand{\cftbeforesubsubsubsectionskip}{\cftbeforeparagraphskip}

\newcommand{\setsubsubsubsecheadstyle}{\setparaheadstyle}

\setafterparaskip{1.0\onelineskip plus 0.5\onelineskip minus 0.2\onelineskip}
\setparaheadstyle{\normalfont
\raggedright
} 

%Parou de funcionar depois da atualização do \MakeUppercase{}
%\let\oldchapter\chapter
%\renewcommand{\chapter}{\@ifstar{\mychapterstar}{\mychapter}}
%\newcommand{\mychapterstar}[2][]{\oldchapter*{\MakeUppercase{#2}}}
%\newcommand{\mychapter}[1]{\oldchapter{\MakeUppercase{#1}}}


\newcommand\capmystring[1]{\capmystringaux#1\relax}
\def\capmystringaux#1#2\relax{\MakeUppercase{#1}\MakeLowercase{#2}}

%Parou de funcionar depois da atualização do \MakeUppercase{}
% \let\oldsection\section
% \renewcommand{\section}{\@ifstar{\mysubsectionstar}{\mysection}}
% \newcommand{\mysectionstar}[1]{\oldsection*{\capmystring{#1}}}
% \newcommand{\mysection}[1]{\oldsection{\capmystring{#1}}}
% 
% \let\oldsubsection\subsection
% \renewcommand{\subsection}{\@ifstar{\mysubsectionstar}{\mysubsection}}
% \newcommand{\mysubsectionstar}[1]{\oldsubsection*{\capmystring{#1}}}
% \newcommand{\mysubsection}[1]{\oldsubsection{\capmystring{#1}}}
%    
% \let\oldsubsubsection\subsubsection
% \renewcommand{\subsubsection}{\@ifstar{\mysubsubsectionstar}{\mysubsubsection}}
% \newcommand{\mysubsubsectionstar}[1]{\oldsubsubsection*{\capmystring{#1}}}
% \newcommand{\mysubsubsection}[1]{\oldsubsubsection{\capmystring{#1}}}
% 
% \let\oldsubsubsubsection\subsubsubsection
% \renewcommand{\subsubsubsection}{\@ifstar{\mysubsubsubsectionstar}{\mysubsubsubsection}}
% \newcommand{\mysubsubsubsectionstar}[1]{\oldsubsubsubsection*{\capmystring{#1}}}
% \newcommand{\mysubsubsubsection}[1]{\oldsubsubsubsection{\capmystring{#1}}}

\renewcommand{\thesubsection}{{\thesection}.\arabic{subsection}}

\renewcommand{\thesubsubsection}
{{\thesection}.\arabic{subsection}.\arabic{subsubsection}}

\renewcommand{\theparagraph}
{{\thesection}.\arabic{subsection}.\arabic{subsubsection}.\arabic{paragraph}}


%------------------------------------

\setrmarg{0em} 

\renewcommand{\cftfigurename}{\figurename\space} 
\renewcommand*{\cftfigureaftersnum}{\hfill \textendash \hfill} 
\renewcommand{\cftfigureafterpnum}{\cftparfillskip} 

\newcommand{\typeilust}[1]{\renewcommand{\cftfigurename}{#1 \space}
\renewcommand{\figurename}{#1}
}

\newcommand{\figvariadas}{
%\renewcommand{\fnum@figure}{} 
}

\newcommand{\listfigvariadas}{
\setlength{\cftfigurenumwidth}{24pt}
\setlength{\cftfigureindent}{0pt}
\begingroup
%\renewcommand\numberline[1]{} 
\listoffigures*
\endgroup
}

\renewcommand{\cfttablename}{\tablename\space}
\renewcommand*{\cfttableaftersnum}{\hfill \textendash \hfill}	
\renewcommand{\cfttableafterpnum}{\cftparfillskip} 


\renewcommand*{\cftchapterdotsep}{\cftdotsep}

\setlength{\cftbeforechapterskip}{0pt plus 0pt}
\renewcommand*{\insertchapterspace}{}

\newlength{\cftlastnumwidth}
\setlength{\cftlastnumwidth}{\cftsubsubsectionnumwidth+1em}

\newcommand{\tocprintchapter}{}
\newcommand{\tocinnonumchapter}{}
\newcommand{\tocprintchapternonum}{}

\cftinsertcode{AAA}{\renewcommand{\cftchapteraftersnum}{\hfill \textendash \hfill \flushleftright}}
  
\cftsetindents{part}{0em}{\cftlastnumwidth}
\cftsetindents{chapter}{0em}{\cftlastnumwidth}
\cftsetindents{section}{0em}{\cftlastnumwidth}
\cftsetindents{subsection}{0em}{\cftlastnumwidth}
\cftsetindents{subsubsection}{0em}{\cftlastnumwidth}
\cftsetindents{paragraph}{0em}{\cftlastnumwidth}
\cftsetindents{subparagraph}{0em}{\cftlastnumwidth}
  
\renewcommand{\tocprintchapter}{
    \addtocontents{toc}{\cftsetindents{chapter}{0em}{\cftlastnumwidth}}}
  
\renewcommand{\tocinnonumchapter}{
    \addtocontents{toc}{\cftsetindents{chapter}{\cftlastnumwidth}{2em}}
    \cftinserthook{toc}{AAA}}
  
\renewcommand{\tocprintchapternonum}{
    \addtocontents{toc}{\cftsetindents{chapter}{\cftlastnumwidth}{2em}}}  
    
%------------------------------------

\setsecheadstyle{\bfseries \normalsize \flushleftright}
\setsubsecheadstyle{\bfseries \normalsize \flushleftright}
\setsubsubsecheadstyle{\bfseries \normalsize \flushleftright}
\setsubsubsubsecheadstyle{\bfseries \normalsize \flushleftright}

\provideboolean{innonumchapter}  
\setboolean{innonumchapter}{true}
\makechapterstyle{abntcefetmglpd}{%
  \renewcommand*{\chapterheadstart}{} 
  \renewcommand*{\chapternamenum}{}
  \renewcommand*{\afterchapternum}{}
  \renewcommand*{\midchapskip}{} 
  
\setlength{\beforechapskip}{0pt}
    
\renewcommand{\printchaptername}{
   \ifthenelse{\boolean{AppendixAnexo}}
   {}{}
  }
  
  \def\printchaptertitle##1{%
   \bfseries
   \ifthenelse{\boolean{innonumchapter}}{
    \normalsize \centering \MakeUppercase
    {##1\break}}{%
    \normalsize \ifthenelse{\boolean{AppendixAnexo}}{
      \centering \MakeUppercase
        {##1\break}
      }{%
       \flushleftright 
        \hfill
          \parbox[t]{\textwidth-36pt}
           {
           \normalsize \MakeUppercase
        {##1}}}
    }    
  }
       
\renewcommand{\printchapternum}{
     \tocprintchapter
     \setboolean{innonumchapter}{false}
     \normalsize\bfseries 
     \space\thechapter\space%
     \ifthenelse{\boolean{AppendixAnexo}}{
     }{} 
  }
  
    
  
    
\renewcommand\printchapternonum{
\tocprintchapternonum
\setboolean{innonumchapter}{true}
}
}

\chapterstyle{abntcefetmglpd}
%\chapterstyle{hangnum}
\makepagestyle{abntcefetmglpdchapfirst}
\makeoddhead{abntcefetmglpdchapfirst}{}{}{\normalsize\thepage}


%------------------------------------

\newcommand{\pretextual}{
  \aliaspagestyle{chapter}{empty}
  \pagestyle{empty}
  \aliaspagestyle{cleared}{empty}
  \aliaspagestyle{part}{empty}
}
\renewcommand{\frontmatter}{\pretextual} 

\AtBeginDocument{\pretextual}

%------------------------------------


\newcommand{\titulo}[1]{\title{#1}}
\newcommand{\printatitulo}{\thetitle}
\newcommand{\printatituloUpper}{\MakeUppercase{\thetitle}}

\newcommand{\autor}[1]{\author{#1}}
\newcommand{\printaautor}{\theauthor}
\newcommand{\printaautorUpper}{\MakeUppercase{\theauthor}}

\providecommand{\printatituloIngles}{}
\newcommand{\tituloIngles}[1]{\renewcommand{\printatituloIngles}{#1}}
\newcommand{\printatituloInglesUpper}{\MakeUppercase{\printatituloIngles}}

\providecommand{\printasubtituloIngles}{}
\newcommand{\subtituloIngles}[1]{\renewcommand{\printasubtituloIngles}{#1}}
\newcommand{\printasubtituloInglesUpper}{\MakeUppercase{\printasubtituloIngles}}

\let\olddate\date
\renewcommand{\date}[1]{\AtBeginDocument{\olddate{#1}}}
\newcommand{\data}[1]{\date{#1}}
\newcommand{\printadata}{\thedate}

%\providecommand{\printames}{}
%\newcommand{\mes}[1]{\renewcommand{\printames}{#1}}

\providecommand{\printamatricula}{}
\newcommand{\matricula}[1]{\renewcommand{\printamatricula}{#1}}

\providecommand{\printainstituicao}{}
\newcommand{\instituicao}[1]{\renewcommand{\printainstituicao}{#1}}

\providecommand{\printafaculdade}{}
\newcommand{\faculdade}[1]{\renewcommand{\printafaculdade}{#1}}

\providecommand{\printalocal}{}
\newcommand{\local}[1]{\renewcommand{\printalocal}{#1}}

\providecommand{\printanatureza}{}
\newcommand{\natureza}[1]{\renewcommand{\printanatureza}{#1}}
\newcommand{\printanaturezaUpper}{\MakeUppercase{\printanatureza}}

\providecommand{\printaobjeto}{}
\newcommand{\objeto}[1]{\renewcommand{\printaobjeto}{#1}}

\providecommand{\printaprograma}{}
\newcommand{\programa}[1]{\renewcommand{\printaprograma}{#1}}

\providecommand{\printasubtitulo}{}
\newcommand{\subtitulo}[1]{\renewcommand{\printasubtitulo}{\capmystring{#1}}}
\newcommand{\printasubtituloUpper}{\MakeUppercase{\printasubtitulo}}

\providecommand{\printafinalcatalog}{}
\newcommand{\finalcatalog}[1]{\renewcommand{\printafinalcatalog}{#1}}

\providecommand{\printaautorVirg}{}
\newcommand{\autorVirg}[1]{\renewcommand{\printaautorVirg}{#1}}

\providecommand{\printaautorSobrenome}{}
\newcommand{\autorSobrenome}[1]{\renewcommand{\printaautorSobrenome}{#1}}

\providecommand{\printaorientadorOU}{}
\providecommand{\printaorientador}{}
\newcommand{\orientador}[2][\orientadornome]
  {\renewcommand{\printaorientadorOU}{#1}
   \renewcommand{\printaorientador}{#2}}
\newcommand{\printaorientadorOUUpper}{\MakeUppercase{\printaorientadorOU}}
\newcommand{\printaorientadorUpper}{\MakeUppercase{\printaorientador}}

\providecommand{\printacoorientadorOU}{}
\providecommand{\printacoorientador}{}
\newcommand{\coorientador}[2][\coorientadornome]
  {\renewcommand{\printacoorientadorOU}{#1}
   \renewcommand{\printacoorientador}{#2}}
\newcommand{\printacoorientadorOUUpper}{\MakeUppercase{\printacoorientadorOU}}
\newcommand{\printacoorientadorUpper}{\MakeUppercase{\printacoorientador}}
   
\providecommand{\printaorientadorTitulo}{}
\newcommand{\orientadorTitulo}[1]{\renewcommand{\printaorientadorTitulo}{#1}}
   
\providecommand{\printacoorientadorTitulo}{}
\newcommand{\coorientadorTitulo}[1]{\renewcommand{\printacoorientadorTitulo}{#1}}

\providecommand{\printasiglaInstituicaoCoorientador}{}
\newcommand{\siglaInstituicaoCoorientador}[1]{\renewcommand{\printasiglaInstituicaoCoorientador}{#1}}  

\providecommand{\printasiglaInstituicao}{}
\newcommand{\siglaInstituicao}[1]{\renewcommand{\printasiglaInstituicao}{#1}}

\providecommand{\printaavaliadorUm}{}
\newcommand{\avaliadorUm}[1]{\renewcommand{\printaavaliadorUm}{#1}}

\providecommand{\printaavaliadorDois}{}
\newcommand{\avaliadorDois}[1]{\renewcommand{\printaavaliadorDois}{#1}}

\providecommand{\printaavaliadorTres}{}
\newcommand{\avaliadorTres}[1]{\renewcommand{\printaavaliadorTres}{#1}}

\providecommand{\printatitulacaoAvaliadorUm}{}
\newcommand{\titulacaoAvaliadorUm}[1]{\renewcommand{\printatitulacaoAvaliadorUm}{#1}}

\providecommand{\printatitulacaoAvaliadorDois}{}
\newcommand{\titulacaoAvaliadorDois}[1]{\renewcommand{\printatitulacaoAvaliadorDois}{#1}}

\providecommand{\printatitulacaoAvaliadorTres}{}
\newcommand{\titulacaoAvaliadorTres}[1]{\renewcommand{\printatitulacaoAvaliadorTres}{#1}}

\providecommand{\printasiglaInstituicaoAvaliadorUm}{}
\newcommand{\siglaInstituicaoAvaliadorUm}[1]{\renewcommand{\printasiglaInstituicaoAvaliadorUm}{#1}}

\providecommand{\printasiglaInstituicaoAvaliadorDois}{}
\newcommand{\siglaInstituicaoAvaliadorDois}[1]{\renewcommand{\printasiglaInstituicaoAvaliadorDois}{#1}}

\providecommand{\printasiglaInstituicaoAvaliadorTres}{}
\newcommand{\siglaInstituicaoAvaliadorTres}[1]{\renewcommand{\printasiglaInstituicaoAvaliadorTres}{#1}}

\providecommand{\printaaprovacaoDia}{}
\newcommand{\aprovacaoDia}[1]{\renewcommand{\printaaprovacaoDia}{#1}}

\providecommand{\printaaprovacaoMes}{}
\newcommand{\aprovacaoMes}[1]{\renewcommand{\printaaprovacaoMes}{#1}}

\providecommand{\printaaprovacaoAno}{}
\newcommand{\aprovacaoAno}[1]{\renewcommand{\printaaprovacaoAno}{#1}}

\providecommand{\printaNumCatalog}{}
\newcommand{\NumCatalog}[1]{\renewcommand{\printaNumCatalog}{#1}}

\providecommand{\printaCDU}{}
\newcommand{\CDU}[1]{\renewcommand{\printaCDU}{#1}}


\newcommand\mesentrega[1]{
  \ifthenelse{\equal{#1}{1}}
    {\global\def\local@mes{Janeiro}
	 \global\def\local@month{January}}{}
  \ifthenelse{\equal{#1}{2}}
    {\global\def\local@mes{Fevereiro}
	 \global\def\local@month{February}}{}
  \ifthenelse{\equal{#1}{3}}
    {\global\def\local@mes{Março}
	 \global\def\local@month{March}}{}
  \ifthenelse{\equal{#1}{4}}
    {\global\def\local@mes{Abril}
	 \global\def\local@month{April}}{}
  \ifthenelse{\equal{#1}{5}}
    {\global\def\local@mes{Maio}
	 \global\def\local@month{May}}{}
  \ifthenelse{\equal{#1}{6}}
    {\global\def\local@mes{Junho}
	 \global\def\local@month{June}}{}
  \ifthenelse{\equal{#1}{7}}
    {\global\def\local@mes{Julho}
	 \global\def\local@month{July}}{}
  \ifthenelse{\equal{#1}{8}}
    {\global\def\local@mes{Agosto}
	 \global\def\local@month{August}}{}
  \ifthenelse{\equal{#1}{9}}
    {\global\def\local@mes{Setembro}
	 \global\def\local@month{September}}{}
  \ifthenelse{\equal{#1}{10}}
    {\global\def\local@mes{Outubro}
	 \global\def\local@month{October}}{}
  \ifthenelse{\equal{#1}{11}}
    {\global\def\local@mes{Novembro}
	 \global\def\local@month{November}}{}
  \ifthenelse{\equal{#1}{12}}
    {\global\def\local@mes{Dezembro}
	 \global\def\local@month{December}}{}
 
}
%  -------IMPLEMENTAR -------
%\ifthenelse{\equal{\printaobjeto}{Trabalho de Conclusão de Curso}}
%	{\global\def\objetoIngles{Final Year Project}
%	 \global\def\obtencaoTitulo{Bacharel}
%	 \global\def\obtencaoTitle{Barchelor}}{}
%\ifthenelse{\equal{\printaobjeto}{Dissertação}}
%	{\newcommand{\objetoIngles{Dissertation}}
%	 \newcommand{\obtencaoTitulo{Mestre}}
%	 \newcommand{\obtencaoTitle{Master}}}{}
%\ifthenelse{\equal{\printaobjeto}{Dissertação}}
%	{\newcommand{\objetoIngles{Thesis}}
%	 \newcommand{\obtencaoTitulo{Doutor}}
%	 \newcommand{\obtencaoTitle{Doctor}}}{}
   

%------------------------------------

\newenvironment{capa}{\begin{titlingpage}}{\end{titlingpage}\cleardoublepage}

\newcommand{\printacapa}{
  \begin{center}
    {
    \bfseries\DoubleSpacing
    \MakeUppercase{\printainstituicao}\\ 
    \MakeUppercase{CURSO DE \printaprograma}\\
    \vspace*{135pt}
    \MakeUppercase{\printaautor}} 
    \vspace*{50pt}
%     \begin{center} 
%    \bfseries\DoubleSpacing
%    \MakeUppercase{\printaorientadorOU :~\printaorientador \par }\\
%     \IfNonempty{\printacoorientador}{
% 		\MakeUppercase{\printacoorientadorOU :~\printacoorientador}
%     }
%     \end{center}
     \vspace*{50pt}
    \begin{center}
      {
        \bfseries\DoubleSpacing \printatituloUpper 
        \IfNonempty{\printasubtitulo}{:\\\printasubtitulo}}
    \end{center}
    \vspace*{\fill}
  \end{center}	
  \begin{center}  
    \bfseries \printalocal \par \printadata   
  \end{center}
\cleardoublepage
}

\newenvironment{folhaderosto}[1][\folhaderostonome]{\clearpage\bookmarkphantom{#1}}{\newpage}

%% --
\newcommand{\folhaderostocont}{
  \begin{center}
    {
    \bfseries
    \MakeUppercase{\printaautor}} 
    \vspace*{160pt}
        \begin{center}
      {
        \bfseries \printatituloUpper 
        \IfNonempty{\printasubtitulo}{:\\\printasubtitulo}}
    \end{center}
    \vspace{100pt}
      \IfNonempty{\printanatureza}{
      \hspace{.45\textwidth}
      \begin{minipage}{.5\textwidth}
        \hyphenchar\font=-1 \sloppy
      	\SingleSpacing
         \printanatureza
      \end{minipage}
    }
  \end{center}	
  \begin{center} 
   \hspace{.45\textwidth}
    \begin{minipage}{.5\textwidth}
    {\printaorientadorOU :~\printaorientador  }\\
    \IfNonempty{\printacoorientador}{
      {\printacoorientadorOU :~\printacoorientador}
    }
    \end{minipage}
  \end{center}
  \vspace*{\fill}
  \begin{center}  
    \bfseries  \printalocal \par \printadata   
  \end{center}
}

%% --

\newcommand{\printafolhaderosto}[1]{
  \begin{folhaderosto}{#1}
     \folhaderostocont
  \end{folhaderosto}}

%% --

\def\pagroman{\getpagerefnumber{sumario_num}}

\newcommand*{\rom}[1]{\MakeLowercase{\expandafter\@slowromancap\romannumeral #1@}}

\newcommand{\printacatalog}{
\thispagestyle{empty}

\ifthenelse{\boolean{@twoside}}
{}
{\addtocounter{page}{-1}}

{
\vspace*{\fill}
\begin{center}

\fbox{\hspace*{0.3cm} \begin{minipage}[t]{1.5cm} \SingleSpacing \footnotesize
			\printaNumCatalog \\[6pt]
			\printadata
		\end{minipage}
	    \begin{minipage}[t]{10.56cm} \SingleSpacing \footnotesize
			\printaautorVirg . \\[6pt]
			\hspace*{1.05cm} \printatitulo \IfNonempty{\printasubtitulo}{ : \printasubtitulo} ~/ \printaautor\\[6pt]
			\printaautorSobrenome~- Leopoldina :~\printasiglaInstituicao,~\printaaprovacaoAno.\\[6pt]
			\hspace*{1.05cm} \rom{\pagroman}, \pageref{LastPage} f. \if@eu@hasil : il.~\fi \\[16pt]
			\hspace*{1.05cm} \printaorientadorOU :~\printaorientador
			{\IfNonempty{\printacoorientador}{%
					{\par\hspace*{1.05cm} \printacoorientadorOU :~\printacoorientador }%
				}
			}
		   \\[16pt]
			%\hspace*{0.45cm} \printaobjeto ~\textendash ~\printainstituicao , \printafaculdade . \printaprograma , \printadata . \\[12pt]
			\hspace*{1.05cm} TCC (Graduação) ~\textendash ~\printainstituicao , \printafaculdade . \printaprograma. \\[6pt]
			\hspace*{1.05cm}  \printafinalcatalog  \par
			\flushright \printaCDU
			\vspace*{12pt}
			\hspace*{0.3cm}
	\end{minipage} \hspace*{0.3cm}}



 \begin{minipage}[c]{13cm}
 \begin{flushleft}
\footnotesize Elaboração da ficha catalográfica pela bibliotecária Luzia Adriana Damasceno, CRB 6º 2305 / CEFET-MG campus Leopoldina.
 \end{flushleft}

 \end{minipage}

\end{center}}
}


%%%
    
\newenvironment{folhadeaprovacao}[1][\folhadeaprovacaonome]{
   \clearpage
   \bookmarkphantom{#1}
   \begin{Spacing}{1.0}
}{\end{Spacing}
\cleardoublepage}

\newcommand{\folhaaprov}{
\begin{center}
    {\bfseries \MakeUppercase{\printaautor}}

    \vspace*{20pt}
    \begin{center}
      {
      \bfseries \MakeUppercase{ \printatitulo} \IfNonempty{\printasubtitulo}{: \capmystring{\printasubtitulo}}
    }
    \end{center}
    \vspace*{100pt}
    \hspace{.45\textwidth}
    \begin{minipage}{.5\textwidth}
              \hyphenchar\font=-1 \sloppy
              Trabalho de conclusão de curso apresentado ao Curso de Engenharia de Computação do Centro Federal de Educação 
              Tecnológica de Minas Gerais, do Campus Leopoldina, como parte do requisito para obtenção do título de Bacharel em Engenharia de Computação.
    \end{minipage}%
\end{center}
\begin{flushleft}
Aprovado em: \printaaprovacaoDia ~de \printaaprovacaoMes ~de \printaaprovacaoAno 
\end{flushleft}
\begin{center} Banca Examinadora: \end{center}
\begin{center}
\OnehalfSpacing
\vspace*{20pt}
\printaorientadorTitulo ~\printaorientador - \printaorientadorOU \\ \printasiglaInstituicao \\
\IfNonempty{\printacoorientador}{
\vspace*{25pt}
\printacoorientadorTitulo ~\printacoorientador - \printacoorientadorOU \\ \printasiglaInstituicaoCoorientador \\}
\vspace*{25pt}
\printatitulacaoAvaliadorUm ~\printaavaliadorUm \\ \printasiglaInstituicaoAvaliadorUm \\
\vspace*{25pt}
\printatitulacaoAvaliadorDois ~\printaavaliadorDois \\ \printasiglaInstituicaoAvaliadorDois \\
\IfNonempty{\printaavaliadorTres}{
\vspace*{25pt}
\printatitulacaoAvaliadorTres ~\printaavaliadorTres \\ \printasiglaInstituicaoAvaliadorTres \\}
\vspace*{25pt}
(Assinaturas Digitais)
\end{center}

\vfill

\begin{center}  
	\bfseries  \printalocal \par \printadata   
\end{center}

}

\newcommand{\printafolhaaprov}[1]{
  \begin{folhadeaprovacao}{#1}
     \folhaaprov
  \end{folhadeaprovacao}
  \cleardoublepage}

%%%
    
\newenvironment{termocompromisso}[1][\termocompromissonome]{
   \clearpage
   \bookmarkphantom{#1}
   \begin{Spacing}{1.0}
}{\end{Spacing}
\cleardoublepage}

\newcommand{\termo}{
\OnehalfSpacing
\vspace*{5pt}
\begin{center}
 \textbf{TERMO DE RESPONSABILIDADE POR AUTORIA DO TRABALHO DE CONCLUSÃO DE CURSO}
\end{center}
\vspace*{40pt}

Eu, \MakeUppercase{\textbf{\printaautor}}, matrícula \MakeUppercase{\textbf{\printamatricula}}, discente do Curso de Engenharia de
Computação, declaro para os devidos fins, que o presente Trabalho de Conclusão de Curso, de título \MakeUppercase{\textbf{\printatitulo}}, 
é de minha autoria e que estou 
ciente dos:
\begin{itemize}
 \item Artigos 297 a 299 do Código Penal;
 \item Decreto-Lei n 2.848 de 7 de dezembro de 1940;
 \item Lei no 9.610, de 19 de fevereiro de 1998, sobre os Direitos Autorais;
 \item Regulamento Disciplinar Discente do CEFET-MG;
 \item E que plágio consiste na reprodução de obra alheia e submissão dela como trabalho próprio ou na inclusão, em trabalho próprio, de ideias, textos, tabelas ou ilustrações (quadros, figuras, gráficos, fotografias, retratos, lâminas, desenhos, organogramas, fluxogramas, plantas, mapas e outros) transcritos de obras de terceiros sem a devida e correta citação da referência.
\end{itemize}

Por ser verdade, e por ter ciência do referido artigo, firmo a presente declaração, isentando 
o(a) professor(a) orientador(a) \MakeUppercase{\textbf{\printaorientador}}
\IfNonempty{\printacoorientador}{, o(a) professor(a) coorientador(a) \MakeUppercase{\textbf{\printacoorientador}}}, os membros da banca examinadora e o Centro Federal de Educação Tecnológica de Minas Gerais, 
Campus Leopoldina, de qualquer responsabilidade.

\begin{center}
\vspace*{20pt}
Leopoldina \printaaprovacaoDia ~de \printaaprovacaoMes ~de \printaaprovacaoAno 

\assinaturaCentro{Assinatura do Discente}
\end{center}
}

\newcommand{\printatermo}[1]{
  \begin{termocompromisso}{#1}
     \termo
  \end{termocompromisso}
  \cleardoublepage}

\newenvironment{dedicatoria}[1][]{
   \ifthenelse{\equal{#1}{}}{
    \bookmarkphantom{\dedicatorianome}
    }{\pretextualchapter{#1}}
    \vspace*{\fill} 
    \begin{quote}
    \addtolength{\leftskip}{6cm}
  }{
    \end{quote}
  \cleardoublepage}
  
\newenvironment{agradecimentos}[1][\agradecimentosnome]{
   \pretextualchapter{#1}
  }{
  \cleardoublepage}
  
\newenvironment{epigrafemenos}[1][]{
   \ifthenelse{\equal{#1}{}}{
    \bookmarkphantom{\epigrafenome}
    }{\pretextualchapter{#1}}
    \vspace*{\fill}
    \noindent 
    }{
    \cleardoublepage} 
    
\newenvironment{epigrafemais}[1][]{
   \ifthenelse{\equal{#1}{}}{
    \bookmarkphantom{\epigrafenome}
    }{\pretextualchapter{ #1}}
    \vspace*{\fill} 
    \begin{citacao}{}\normalsize \normalfont}
    {\end{citacao} \cleardoublepage}
  
  
\setlength\absleftindent{0cm}
\setlength\absrightindent{0cm}
  
\renewcommand{\abstracttextfont}{\normalsize}

\newenvironment{resumo}[1][\resumonome]{
   \bookmarkphantom{#1}
   \renewcommand{\abstractname}{\bfseries 
   {#1}}
   \begin{abstract}
  }{\end{abstract}
\cleardoublepage}


\newenvironment{resumo_cefetmg}[1][\resumonome]{
   \bookmarkphantom{#1}
   \renewcommand{\abstractname}{\bfseries 
   {#1}}
  }{\cleardoublepage}


\newcommand{\aplicaresumo}{
  \begin{center}
    {
    \begin{center}
      {
      \bfseries \printatituloUpper \mdseries 
        \IfNonempty{\printasubtitulo}{: \printasubtitulo}}
    \end{center}
	\vspace*{40pt}
	\printaautor \par
	   {\printaorientador \par }
    \IfNonempty{\printacoorientador}{
	   {\printacoorientador}
    }}
    \vspace*{20pt}
	  \begin{center}  
			\bfseries RESUMO
		\end{center}
  \end{center}
  \vspace*{20pt}
}

\newenvironment{abstract_cefetmg}[1][\resumonome]{
   \bookmarkphantom{#1}
   \renewcommand{\abstractname}{\bfseries 
   {#1}}
  }{\cleardoublepage}


\newcommand{\aplicaabstract}{
  \begin{center}
    {
    \begin{center}
      {
      \bfseries \printatituloInglesUpper \mdseries 
        \IfNonempty{\printasubtituloIngles}{: \printasubtituloIngles}}
    \end{center}
    	\vspace*{40pt}
	\printaautor \par
	   {\printaorientador \par }
    \IfNonempty{\printacoorientador}{
	   {\printacoorientador}
    }}
    \vspace*{20pt}
	  \begin{center}  
			\bfseries ABSTRACT
		\end{center}
  \end{center}
  \vspace*{20pt}
}

%% --


\newenvironment{siglas}{
  \pretextualchapter{\listadesiglasnome}
  \begin{acronym} 
  \setlength{\itemsep}{-1.8em} 
  }{
  \end{acronym}
  \cleardoublepage
  }

\newenvironment{simbolos}{
  \pretextualchapter{\listadesimbolosnome}
\begin{symbols} 
\setlength{\itemsep}{-0.5em} 
}{
\end{symbols}
  \cleardoublepage
}

\newenvironment*{citacao}
{
   \list{}
   \small
   \addtolength{\leftskip}{4cm}
   \item[]
   \begin{SingleSpace}
   }
 {
   \end{SingleSpace}
   \endlist}

%% --
\newlist{alineas}{enumerate}{1}
\setlist[alineas,1]{label={\alph*)},topsep=0pt,itemsep=0pt,leftmargin=\parindent+\labelwidth-\labelsep}

\newlist{subalineas}{enumerate}{1}
\setlist[subalineas,1]{label={--},topsep=0pt,itemsep=0pt,leftmargin=*}
%% --
  
\newlength{\signwidth} 
\setlength{\signwidth}{13cm} 
\newlength{\signthickness} 
\setlength{\signthickness}{1pt}
\newlength{\signskip} 
\setlength{\signskip}{1cm} 
  
\newcommand{\assinatura}[1]{
  \begingroup\par\raggedleft 
  \parbox[t]
  {\signwidth}{\SingleSpacing\vspace*{\signskip}\raggedleft
  \rule{\signwidth}{\signthickness}\\
  \nopagebreak #1\par}
  \par\endgroup}
  
  
\newcommand{\assinaturah}[1]{
  \begingroup\par\raggedleft 
  \parbox[t]
  {\signwidth}{\SingleSpacing\raggedleft
  \rule{\signwidth}{\signthickness}\\
  \nopagebreak #1\par}
  \par\endgroup}  
  
\newcommand{\assinaturaCentro}[1]{
  \begingroup\par\centering
  \parbox[t]
  {\signwidth}{\SingleSpacing\vspace*{\signskip}\centering
  \rule{\signwidth}{\signthickness}\\
  \nopagebreak #1\par}
  \par\endgroup}  


%------------------------------------

\newcommand{\textual}{
    \pagestyle{simple} 
    \aliaspagestyle{chapter}{abntcefetmglpdchapfirst}
  \nouppercaseheads
  \bookmarksetup{startatroot}
\aliaspagestyle{cleared}{simple} 
  }
\renewcommand{\mainmatter}{\textual}

%------------------------------------

\newcommand{\postextual}{\bookmarksetup{startatroot}
  \phantomsection 
  }
  
\renewcommand{\backmatter}{\postextual}

%---
   


%%---

\newcommand\@switch[1]{ \@writefile{toc}
{\renewcommand*{\cftappendixname}{%
}} }
\newcommand{\switchchapname}[1]{ \protected@write \@auxout {}{\string\@switch{#1} }}

\newcommand{\apendiceanexoformato}[2]{%
 \setboolean{AppendixAnexo}{true}
 \renewcommand{\appendixname}{#1}
 \renewcommand{\appendixpagename}{#2}
 \switchchapname{#1}
 \renewcommand*{\cftappendixname}{%
 }
}

 
\newenvironment{apendices}{
\apendiceanexoformato{}
{\apendicesnome}
\newcommand{\apendseq}{\apendicenome \space \Alph{chapter}\space \textendash ~}
\begin{appendix}
 \renewcommand*{\thechapter}{}
 \renewcommand{\thesection}{\Alph{chapter}.\arabic{section}}
 \renewcommand{\thesubsection}{\Alph{chapter}.\arabic{section}.\arabic{subsection}}
 \renewcommand{\thesubsubsection}{\Alph{chapter}.\arabic{section}.\arabic{subsection}.\arabic{subsubsection}}
 \renewcommand{\thefigure}{\Alph{chapter}.\arabic{figure}}
 }{
 \end{appendix}
\setboolean{AppendixAnexo}{false}
\bookmarksetup{startatroot}
}
 
\newenvironment{anexos}{
\apendiceanexoformato{}
{\anexosnome} 
\newcommand{\anexoseq}{\anexonome \space \Alph{chapter}\space \textendash ~}
\begin{appendix}
 \renewcommand*{\thechapter}{}
 \renewcommand{\thesection}{\Alph{chapter}.\arabic{section}}
 \renewcommand{\thesubsection}{\Alph{chapter}.\arabic{section}.\arabic{subsection}}
 \renewcommand{\thesubsubsection}{\Alph{chapter}.\arabic{section}.\arabic{subsection}.\arabic{subsubsection}}
 \renewcommand{\thefigure}{\Alph{chapter}.\arabic{figure}}
}{
 \end{appendix}
 \setboolean{AppendixAnexo}{false}
 \bookmarksetup{startatroot}
}


% ---
% ---  


