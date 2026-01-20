# Fase de construcción de Node.js
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Fase final: Servir con Nginx
FROM nginx:alpine

# Copiar los archivos de la build desde la fase anterior
COPY --from=build /app/build /usr/share/nginx/html

# Copiar el archivo de configuración de Nginx personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para correr Nginx
CMD ["nginx", "-g", "daemon off;"]
