# Usamos una imagen base de Node.js
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos de la aplicación al contenedor
COPY . .

# Exponemos el puerto en el que corre la aplicación
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "run", "dev"]
