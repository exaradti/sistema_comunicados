# Sistema de Comunicados

Projeto unificado em Next.js + TypeScript com:

- `app/api` para a camada robusta de backend
- `app/` para páginas administrativas e pública
- `db/001_schema.sql` para criar a modelagem no Supabase/PostgreSQL
- `services/` para o frontend consumir as rotas canônicas

## Rotas canônicas implementadas

- `POST /api/funcionarios`
- `GET /api/funcionarios`
- `PATCH /api/funcionarios/:id`
- `POST /api/setores`
- `GET /api/setores`
- `PATCH /api/setores/:id`
- `POST /api/unidades`
- `GET /api/unidades`
- `PATCH /api/unidades/:id`
- `POST /api/comunicados`
- `GET /api/comunicados`
- `GET /api/comunicados/:id`
- `POST /api/comunicados/:id/enviar`
- `POST /api/comunicados/:id/assinatura`
- `GET /api/confirmacao/:token`
- `POST /api/confirmacao/:token`

## Como rodar

1. Copie `.env.example` para `.env.local`
2. Preencha as variáveis
3. Execute o SQL em `db/001_schema.sql` no Supabase
4. Instale dependências:

```bash
npm install
```

5. Rode o projeto:

```bash
npm run dev
```

## Observações

- O envio de email está implementado como `EMAIL_SIMULADO` em log para manter o projeto utilizável sem provedor SMTP. Substitua `lib/email.ts` por integração real.
- A autenticação administrativa usa `ADMIN_EMAIL` e `ADMIN_PASSWORD` em variável de ambiente e cookie assinado `admin_session`.
- A confirmação pública por token e o fluxo de assinatura já estão integrados ao backend.


## autenticação administrativa

Aplicar também o script `db/002_admin_auth.sql` no Supabase.

Rotas novas:
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/usuarios-admin
- POST /api/usuarios-admin
- GET /api/usuarios-admin/:id
- PATCH /api/usuarios-admin/:id

Usuário inicial após seed:
- email: admin@admin.com
- senha: defina um hash válido no SQL antes de usar em produção
