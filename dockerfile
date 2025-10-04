# Use Node LTS
FROM node:20

# Cria diretório do app
WORKDIR /usr/src/app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia todo o código
COPY . .

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "app.js"]
