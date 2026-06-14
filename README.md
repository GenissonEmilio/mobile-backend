
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


