# Ottimizza Front

Teste tecnico para vaga de front-end na Ottimizza. Um kanban board com suporte offline-first.

## O que foi feito

Uma aplicacao de gerenciamento de boards no estilo kanban. O usuario pode criar boards, e dentro de cada board pode criar colunas e tarefas, mover tudo por drag-and-drop (colunas na horizontal, tarefas na vertical e entre colunas), editar e excluir.

O diferencial ta na parte offline. Tudo funciona sem conexao com a API. Cria, edita, exclui, reordena, e quando a conexao volta, sincroniza automaticamente com o servidor.

## Stack

- **Angular 21** — zoneless, sem zone.js, change detection via signals
- **Angular CDK** — drag-and-drop pra colunas e tarefas
- **Tailwind CSS 4** — estilizacao utility-first com variaveis CSS pra tema claro/escuro
- **IndexedDB** (via `idb`) — persistencia local dos dados
- **Lucide** — icones
- **Zard UI** — design system proprio inspirado no shadcn/ui, usando `class-variance-authority` pra variantes

## Arquitetura

```
src/app/
├── features/           # Paginas e componentes de cada feature
│   ├── board/          # Listagem de boards com CRUD
│   └── kanban/         # Visualizacao kanban com colunas e tarefas
└── shared/
    ├── components/     # Design system proprio (Zard) — button, dialog, input, card, etc
    ├── constants/      # Configuracoes centralizadas (URL da API)
    ├── core/           # Providers e diretivas base
    ├── offline/        # Toda a logica offline-first
    ├── services/       # HTTP services e stores
    ├── types/          # Interfaces de dominio
    └── utils/          # Utilitarios (merge de classes, etc)
```

### Offline-first

A ideia foi que a aplicacao funcione independente do estado da API. A estrutura:

- **Stores** (`BoardStore`, `ColumnStore`, `TaskStore`) — cada operacao grava primeiro no IndexedDB, atualiza o signal, e enfileira a sync. Se a API ta online, processa na hora. Se nao, espera.
- **SyncQueueService** — fila de operacoes pendentes. Quando volta a conexao, processa na ordem de timestamp. Lida com mapeamento de IDs temporarios pra IDs reais do servidor.
- **SyncEngineService** — orquestra retry periodico (30s) enquanto tiver operacoes pendentes.
- **NetworkStatusService** — detecta se ta offline via eventos do browser + health check periodico na API.
- **offlineInterceptor** — intercepta respostas HTTP com status 0, 502, 503, 504 e marca como offline.

O fluxo: o usuario cria uma tarefa → grava no IDB com ID temporario → signal atualiza → UI reflete instantaneamente → operacao entra na fila → quando online, envia pro servidor → servidor retorna ID real → IDB atualiza o ID.

### Reconciliacao

Quando a conexao volta, cada store faz reconciliacao: busca dados remotos, compara com locais, e mescla respeitando operacoes pendentes na fila. Isso garante que dados criados offline nao sejam sobrescritos.

## Como rodar

```bash
npm install
npm start
```

A API precisa estar rodando em `http://localhost:8080` (provida pela equipe de desenvolvimento da Ottimizza).

## Lint e formatacao

```bash
npm run lint        # ESLint
npm run format      # Prettier
```
