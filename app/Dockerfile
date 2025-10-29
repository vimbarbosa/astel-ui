# ============================
# 1️⃣ Etapa de build (Node)
# ============================
FROM node:20-alpine AS build

# Define diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários para o build
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Build da aplicação para produção
RUN npm run build


# ============================
# 2️⃣ Etapa de deploy (Nginx)
# ============================
FROM nginx:alpine

# Remove configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos gerados do build React
COPY --from=build /app/dist /usr/share/nginx/html

# Copia uma configuração customizada para o Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o servidor
CMD ["nginx", "-g", "daemon off;"]
