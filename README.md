# Notas técnicas — Raízes (protótipo)

## O que este pacote é

Um protótipo estático (HTML + CSS + JS puro, sem build, sem servidor) de um site
de apoio a mulheres em situação de violência, feito para a campanha de Agosto
Lilás. Ele mostra o fluxo completo de navegação, login, formulários e
conteúdo — mas **não é um produto pronto para uso real**.

Para abrir: basta abrir `index.html` num navegador, ou subir a pasta inteira
num serviço de hospedagem estática (Netlify, Vercel, GitHub Pages, etc.).
Todos os arquivos precisam continuar juntos na mesma pasta.

## Sobre o "banco de dados"

Você pediu um banco de dados "da forma mais discreta possível". Duas coisas
importantes:

1. **O que existe agora**: os formulários (login, acolhimento, pedido de
   conversa) salvam os dados só no `localStorage` do navegador de quem está
   usando — ou seja, ficam só naquele computador/celular, não vão para
   nenhum servidor. Isso serve para demonstrar a interação, não para operar
   de verdade. Se a pessoa limpar os dados do navegador, tudo some.

2. **Por que não fiz mais que isso**: um banco de dados real, com informações
   de mulheres em situação de violência doméstica, é um dos tipos de dado
   mais sensíveis que existem — envolve risco de vida se vazar. Isso exige
   uma arquitetura de produção real, que este ambiente (geração de arquivos
   estáticos) não consegue provisionar.

### O que a versão de produção precisaria ter

- **Backend próprio**, com servidor de verdade (não arquivos estáticos),
  rodando a lógica de autenticação e gravação fora do navegador do usuário.
- **Criptografia em repouso e em trânsito**: dados sensíveis nunca gravados
  em texto puro; HTTPS obrigatório em tudo.
- **Separação entre identidade e conteúdo sensível**: nomes/e-mails de login
  nunca devem poder ser cruzados facilmente com o conteúdo dos relatos de
  violência (é o princípio de discrição que já apliquei no protótipo, mas
  em produção precisa de arquitetura de banco de dados pensada pra isso,
  não só convenção de nomes de variável).
- **Conformidade com a LGPD**: base legal para tratamento de dados
  sensíveis, política de retenção e exclusão, direito de a pessoa apagar
  seus próprios dados, DPO responsável.
- **Controle de acesso rígido**: só profissionais autorizadas acessam
  relatos; log de quem acessou o quê (auditoria), sem expor esse log a
  qualquer pessoa da equipe.
- **Botão de saída rápida real**: hoje ele redireciona para uma página
  neutra; em produção, vale também limpar o histórico daquela sessão e
  considerar não deixar rastro em cache/histórico do navegador.
- **Hospedagem e infraestrutura**: servidor com backups seguros, plano de
  resposta a incidentes, e idealmente parceria com uma organização que já
  opera nesse tipo de dado (ex.: SaferNet, Ministério das Mulheres) em vez
  de construir do zero.
- **Revisão jurídica e de segurança independente** antes de qualquer dado
  real de uma mulher em situação de violência entrar no sistema.

Recomendo fortemente envolver alguém com experiência em segurança da
informação e em LGPD antes de sair do estágio de protótipo.

## Estrutura de páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Login / entrada anônima |
| `inicio.html` | Hub principal |
| `acolhimento.html` | Formulário de triagem |
| `conversar.html` | Pedido de conversa (psicóloga ou sobrevivente) |
| `psicologas-rede.html` | Psicólogas da rede (perfis ilustrativos) |
| `clinica-especializada.html` | Sobre o atendimento clínico especializado |
| `caps-clinicas-escola.html` | Sobre CAPS e clínicas-escola |
| `sobreviventes.html` | Conversas com quem já venceu (perfis ilustrativos) |
| `localizacao.html` | Canais nacionais + busca por CEP (demo) |
| `lei-maria-da-penha.html` | História da lei + texto oficial |
| `livros.html` | Livros com links de compra |
| `documentarios.html` | Documentários com links para assistir |
| `sobre.html` | Sobre a rede |
| `style.css` | Estilos de todo o site |
| `app.js` | Toda a interatividade (nav, login demo, formulários, filtros) |
