# Usa uma imagem leve do Node.js
FROM node:20-alpine As builder  

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o restante do código da aplicação
COPY . .

FROM node:20-alpine As production

WORKDIR /app

ENV TZ=America/Sao_Paulo

# Expõe a porta que sua aplicação usa
EXPOSE 3000

# Define variável de ambiente de produção
ENV NODE_ENV=production

COPY --from=builder /app .

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
