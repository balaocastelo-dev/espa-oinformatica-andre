# Espaço da Informática — loja virtual

Catálogo + carrinho + pedidos via WhatsApp, com painel administrativo.
Next.js 16, banco de dados SQLite embutido (sem serviços externos).

## O que fica guardado

Tudo fica em uma única pasta (`DATA_DIR`, no Docker `/app/storage`):

- `loja.db` — produtos, categorias, dados da empresa e pedidos
- `uploads/` — fotos e logo enviados pelo painel

Essa pasta precisa ser um **volume persistente**. O `docker-compose.yaml` já cria
o volume `loja-dados` para isso. Na primeira vez que o site sobe, o catálogo de
`data/*.json` é carregado no banco; depois disso, só o banco é usado.

**Backup:** copie a pasta do volume (ou só o arquivo `loja.db` + `uploads/`).

## Variáveis de ambiente

| Variável         | Obrigatória | Para quê                                                     |
| ---------------- | ----------- | ------------------------------------------------------------ |
| `ADMIN_PASSWORD` | sim         | Senha do `/admin`. Sem ela o painel fica bloqueado.          |
| `SITE_URL`       | recomendado | Endereço público (sitemap, links). Ex.: `https://seusite.com` |
| `DATA_DIR`       | não         | Pasta dos dados. Docker: `/app/storage`. Local: `./.data`.   |

## Publicar no Coolify

1. **New Resource → Public/Private Repository** e escolha este repositório (branch `main`).
2. **Build Pack: Docker Compose** (arquivo `docker-compose.yaml`).
3. Em **Environment Variables**, crie `ADMIN_PASSWORD` (e `SITE_URL`).
4. No serviço `loja`, informe o domínio com a porta: `https://seudominio.com:3000`.
5. **Deploy**. O volume `loja-dados` é criado sozinho e mantido entre os deploys.

Verificação: `https://seudominio.com/api/health` deve responder
`{"ok":true,"persistent":true}`.

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
