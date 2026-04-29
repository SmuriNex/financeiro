# Painel Financeiro

Organizador financeiro pessoal em HTML, CSS e JavaScript puro. O app pode rodar direto no navegador pelo arquivo `dinheiro.html` ou pelo servidor local `serve_local.py` quando você quiser usar o proxy de cotações.

## Estrutura

- `dinheiro.html`: estrutura da interface.
- `assets/css/styles.css`: acabamento visual e responsividade.
- `assets/js/app.js`: regras financeiras, persistência, filtros, previsão e interações.

## Recursos

- Resumo mensal de entradas, saídas, resultado previsto e caixa realizado.
- Persistência automática no `localStorage` do navegador.
- Perfil pessoal com renda esperada, objetivo, fechamento e reserva principal.
- Alerta automático quando as saídas chegam a 80% da renda mensal.
- Reserva financeira com meta, valor guardado, aporte e progresso visual.
- Contas previstas/editáveis com vencimento completo, mês, atraso e repetição mensal opcional.
- Contas previstas vinculadas a cartão quando fizer sentido.
- Cartões de crédito múltiplos com limite comprometido, limite disponível, fechamento, vencimento e fatura.
- Filtro por mês, busca, tipo, status, categoria, valor, cartão, origem e período.
- Cadastro de receitas, despesas, compras parceladas, cartão e lançamentos recorrentes.
- Edição, exclusão e marcação de pago/pendente.
- Diagnóstico automático de lucro/prejuízo, renda comprometida, nota de saúde e reserva sugerida.
- Análise de gastos essenciais versus cortáveis.
- Projeção dos próximos 12 meses.
- Simulador de corte de gasto, renda extra, reserva e compra parcelada.
- Classificação automática simples por palavras-chave.
- Modo claro/escuro e ajustes para uso no celular.
- Exportação e importação de dados em JSON.
- Investimentos com cadastro manual ou moedas/criptos acompanhadas pela AwesomeAPI.
- Modo de teste local com login `adm` e senha `adm`; use `?auth=firebase` na URL para testar o fluxo Firebase e `?auth=local` para voltar ao modo local.
- Atalhos instaláveis:
  - `app-pc.html`: abre o app em modo Firebase para instalar no PC.
  - `app-iphone.html`: abre o app em modo Firebase com metatags para adicionar na Tela de Início do iPhone.

## Abrir

Para o uso comum no PC, execute `iniciar-painel-local.bat` e acesse a URL aberta no navegador.

Para sincronizar entre PC e iPhone, publique no Firebase Hosting e use:

- PC: `https://SEU-DOMINIO/app-pc.html`
- iPhone: `https://SEU-DOMINIO/app-iphone.html`

Depois, entre com a mesma conta Firebase nos dois aparelhos. No iPhone, abra pelo Safari e use **Compartilhar > Adicionar à Tela de Início**.

## Firebase

Arquivos adicionados:

- `firebase.json`: configuração de Hosting e Firestore.
- `firestore.rules`: restringe leitura/escrita ao usuário autenticado em `users/{uid}/app/state`.
- `.firebaserc`: aponta para o projeto `meu-financeiro-ec5be`.

Com Firebase CLI instalado e logado:

```bash
firebase deploy
```

No Console do Firebase, confira:

- Authentication: provedor Email/Senha ativado.
- Authentication > Authorized domains: domínio do Hosting autorizado.
- Firestore Database: banco criado em modo produção, usando `firestore.rules`.
