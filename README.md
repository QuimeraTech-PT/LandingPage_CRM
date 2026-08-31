# QuimeraTech Landing Page

Site institucional e painel administrativo da QuimeraTech, construído com React, Vite e TanStack Router. O projeto combina a landing page pública com áreas internas de CRM e gestão operacional, incluindo autenticação protegida, dashboards e integrações com Supabase.

## Acesso protegido ao admin

A rota `/auth` está protegida por uma `VITE_AUTH_SECRET_KEY` e só pode ser acedida com a query string correta:

```text
https://<seu-domínio>/auth?secret=YOUR_SECRET_KEY
```

Sem a chave correta, o utilizador é redirecionado para a página inicial. Este mecanismo serve para evitar que o link de login apareça publicamente e seja descoberto sem autorização.

## Stack principal

- React 19
- Vite
- TanStack Router / Start
- TypeScript
- Tailwind CSS
- Supabase
- shadcn/ui
- Framer Motion

## Funcionalidades

- Landing page pública com hero, sobre, especialidades, metodologia, pilares e contacto
- SEO otimizado com meta tags e schema JSON
- Autenticação protegida para administração
- Área admin com dashboard, leads, empresas, projetos, tarefas, finanças e suporte
- Integrações com Supabase e Google
- Proteção de acesso ao painel via segredo configurável

## Requisitos

- Node.js 20+
- npm

## Setup local

```bash
git clone <url-do-repositorio>
cd landingpage
npm install
cp .env.example .env
npm run dev
```

## Variáveis de ambiente

Copie o conteúdo de [.env.example](.env.example) para um arquivo `.env` local e ajuste os valores:

```env
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_AUTH_SECRET_KEY=your_super_secret_key_change_this_in_production
```

> O acesso ao painel administrativo exige a query string `?secret=YOUR_SECRET_KEY` na rota `/auth`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Estrutura principal

```text
.
├── public/                 # assets públicos e arquivos estáticos
├── src/
│   ├── components/        # UI reutilizável e componentes do site/CRM
│   ├── integrations/     # clientes Supabase e integrações externas
│   ├── lib/              # funções utilitárias, SEO e integrações
│   ├── routes/           # rotas do TanStack Router
│   ├── assets/           # imagens/logo do projeto
│   ├── styles.css        # estilos globais
│   ├── router.tsx        # configuração de rotas
│   └── start.ts          # bootstrap do app
├── supabase/              # migrations e configuração do Supabase
├── .env.example           # template de variáveis de ambiente
├── AUTH_PROTECTION_GUIDE.md
├── components.json
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bunfig.toml
└── README.md
```

## Deploy

A aplicação pode ser publicada com Cloudflare Worker / Vite + TanStack Start. O projeto inclui configuração para deploy do worker e autenticação via segredo do ambiente.

## Segurança

- Não commitar `.env` real ou segredos sensíveis
- Manter `VITE_AUTH_SECRET_KEY` diferente por ambiente
- Usar HTTPS em produção
- Consultar [AUTH_PROTECTION_GUIDE.md](AUTH_PROTECTION_GUIDE.md) para detalhes da protecção do admin

## Observações

Este repositório inclui a landing page pública e o ambiente admin interno da QuimeraTech, sendo uma base para desenvolvimento de software, CRM e gestão operacional em Portugal.
