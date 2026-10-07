# Espaço da Informática — loja virtual

Catálogo + carrinho + pedidos via WhatsApp, com painel administrativo.
Next.js 16. Na Vercel usa o Vercel Blob; em servidor próprio, SQLite embutido.

## Onde os dados ficam

O site escolhe o armazenamento sozinho:

| Onde roda                  | Armazenamento                                   |
| -------------------------- | ----------------------------------------------- |
| **Vercel** (produção)      | Vercel Blob conectado ao projeto                |
| Servidor próprio / Docker  | SQLite + pasta `uploads/` em `DATA_DIR`         |
| Desenvolvimento local      | SQLite em `./.data`                             |

Ficam guardados: produtos, categorias, dados da empresa, pedidos e as fotos
enviadas pelo painel. Enquanto nada foi alterado pelo painel, o catálogo vem de
`data/*.json`.

Verificação: `/api/health` deve responder `{"ok":true,"storage":"blob","persistent":true}`
na Vercel. Se aparecer `"persistent":false`, o Blob store não está conectado e os
dados somem a cada reinício.

## Publicar na Vercel

1. Projeto → **Storage** → **Create Database** → **Blob** → conectar ao projeto
   (todos os ambientes). Isso cria as variáveis do Blob automaticamente.
2. Projeto → **Settings → Environment Variables** → criar `ADMIN_PASSWORD`
   (senha do `/admin`) e, opcionalmente, `SITE_URL`.
3. **Redeploy** (variáveis novas só valem em um novo deploy).

## Variáveis de ambiente

| Variável         | Obrigatória | Para quê                                                     |
| ---------------- | ----------- | ------------------------------------------------------------ |
| `ADMIN_PASSWORD` | sim         | Senha do `/admin`. Sem ela o painel fica bloqueado.          |
| `SITE_URL`       | recomendado | Endereço público (sitemap, links). Ex.: `https://seusite.com` |
| `DATA_DIR`       | não         | Só fora da Vercel: pasta do SQLite e das fotos.              |

## Publicar em servidor próprio (Docker / Coolify)

`docker-compose.yaml` já cria o volume `loja-dados` em `/app/storage`.
No Coolify: Build Pack **Docker Compose**, definir `ADMIN_PASSWORD` e o domínio
do serviço `loja` com a porta 3000.

## Rodar localmente

```bash
npm install
ADMIN_PASSWORD=minha-senha npm run dev     # requer Node 24+
```

Ou com Docker: `ADMIN_PASSWORD=minha-senha docker compose up -d --build`.

## Fluxo de pedido

1. Cliente monta o carrinho e informa nome + WhatsApp.
2. O pedido é gravado no banco (com os preços do catálogo, não os do navegador) e recebe um número (#1001, #1002…).
3. O WhatsApp da loja abre com a mensagem pronta, já com o número do pedido.
4. No `/admin`, aba **Pedidos**: acompanhar, mudar a situação e chamar o cliente no WhatsApp.
