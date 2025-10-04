# Usa uma imagem leve do Node.js
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia apenas os arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta que sua aplicação usa
EXPOSE 3000

# Define variável de ambiente de produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
