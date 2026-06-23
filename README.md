
---

## 🛠 Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
* [Docker](https://www.docker.com/) (para rodar o MariaDB)

## 📦 Dependências do Projeto

### Dependências de Produção (npm install)

Estas são essenciais para o funcionamento da API:

* `express`: Framework para gerenciar as rotas HTTP.
* `@prisma/client`: Cliente para comunicação com o banco de dados.
* `dotenv`: Para carregar as variáveis de ambiente (`.env`).
* `jsonwebtoken`: Para gerenciar a autenticação via JWT.
* `bcryptjs`: Para criptografia de senhas.
* `cors`: Para permitir requisições de outros domínios.

### Dependências de Desenvolvimento (npm install --save-dev)

Estas são usadas apenas durante o desenvolvimento e compilação:

* `typescript`: O compilador da linguagem.
* `ts-node`: Para executar arquivos TypeScript diretamente.
* `@types/node`: Definições de tipo para o Node.js.
* `@types/express`: Definições de tipo para o Express.
* `prisma`: O CLI do Prisma para gerenciar migrações.
* `nodemon`: Para reiniciar o servidor automaticamente ao salvar arquivos.

---

### Dica para o seu amigo:

Você pode sugerir que ele rode este comando único para instalar tudo:

```bash
# Instalar dependências principais
npm install express @prisma/client dotenv jsonwebtoken bcryptjs cors

# Instalar dependências de desenvolvimento
npm install --save-dev typescript ts-node @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors prisma nodemon

```

### O próximo passo lógico:

Agora que o banco está pronto, o seu amigo precisará rodar `npx prisma generate` e `npx prisma migrate dev` logo após clonar o projeto para que o banco dele fique idêntico ao seu.

### npx prisma studio, para manipular o SQL do banco

---

## Rotas principais para o app comparador

Além do CRUD de `/products`, a API agora expõe rotas focadas no fluxo real do app:

## Fluxo de dados externos

O app Flutter não precisa buscar produtos direto em marketplaces. O fluxo correto fica assim:

```text
Marketplace externo -> /external-products/import -> banco da nossa API -> /products/search -> app Flutter
```

Isso deixa a API como a fonte confiável do app. Se amanhã a fonte externa mudar, o app continua chamando as mesmas rotas internas.

### Buscar no provedor externo sem salvar

```http
GET /external-products/search?q=iphone%2015&limit=10
```

Essa rota consulta o provedor externo configurado em `EXTERNAL_PRODUCTS_PROVIDER` e devolve os dados normalizados, mas ainda não grava no banco.

### Importar produtos externos para nossa API

```http
POST /external-products/import
Content-Type: application/json

{
  "q": "iphone 15",
  "category": "Celulares",
  "limit": 10
}
```

Essa rota busca produtos externos e alimenta a tabela `products`.

- Se o `externalId` ainda não existir, cria um novo produto.
- Se o `externalId` já existir e o preço mudou, atualiza `currentPrice`, move o preço antigo para `previousPrice` e grava o preço antigo em `price_history`.
- Se o preço não mudou, mantém o produto e retorna `importedStatus: "unchanged"`.

Variáveis de ambiente usadas:

```env
EXTERNAL_PRODUCTS_PROVIDER="mercadolivre"
MERCADO_LIVRE_API_BASE_URL="https://api.mercadolibre.com"
MERCADO_LIVRE_SITE_ID="MLB"
```

Observação: provedores externos podem bloquear chamadas, exigir credenciais ou aplicar limite de requisições. Quando isso acontece, a API responde com erro `502`, indicando que o problema veio da fonte externa e não do app.

### Buscar produtos para criar alerta

```http
GET /products/search?q=iphone&category=Celulares&limit=20
```

Filtros aceitos: `q`, `store`, `category`, `minPrice`, `maxPrice`, `limit`.

Retorna produtos agregados por `name + category`, usando a menor oferta como preço principal e incluindo `offersCount`, `stores`, `lowestPrice`, `highestPrice`, `averagePrice` e `variationPercentage`.

### Produtos em alta

```http
GET /products/trending?limit=10
```

Retorna produtos ordenados pela maior variação percentual de preço, com `badge` e `badgeType` para alimentar a área de tendências do app.

### Ofertas por loja de um produto

```http
GET /products/:id/offers
```

Retorna o produto agregado e a lista de ofertas equivalentes em lojas diferentes, já ordenadas pelo menor preço.

### Histórico de preços

```http
GET /products/:id/price-history?days=90
```

Retorna o histórico das ofertas equivalentes ao produto informado dentro da janela de dias.

### Registrar nova captura de preço

```http
POST /products/:id/price-snapshots
Content-Type: application/json

{
  "price": 3999.9,
  "externalId": "amazon-iphone-15-128"
}
```

Quando o preço muda, a API salva o preço anterior em `price_history`, atualiza `currentPrice`, move o preço antigo para `previousPrice` e devolve `changed: true`.
