# Usamos una imagen base oficial de Node.js para construir la app
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiamos el package.json y package-lock.json al contenedor
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente al contenedor
COPY . .

# Construimos la aplicación para producción
RUN npm run build

# Fase final: configuración de un servidor web ligero para servir la app
FROM nginx:alpine

# Copiamos los archivos de la build desde la fase anterior
COPY --from=build /app/build /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

# Comando para correr Nginx
CMD ["nginx", "-g", "daemon off;"]
