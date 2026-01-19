# Ariel - Guía rápida de despliegue

## Variables de entorno

### Backend (`back/.env`)
- `PORT` (ej: `3001`)
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `NODE_ENV` (recomendado: `production`)
- `CORS_ORIGIN` (por defecto: `http://localhost:3000`)
  - Admite una lista separada por comas, ejemplo:
    - `CORS_ORIGIN=http://localhost:3000,https://mi-dominio.com`

### Frontend (`front/.env`)
- `REACT_APP_API_URL` (ej: `http://localhost:3001`)

## Seguridad minima sin login

Si no se agrega autenticacion en la app, la forma mas simple de proteger el acceso es:

### Allowlist por IP (Nginx)
Permite solo las IPs del cliente y del administrador.

Ejemplo:
```
server {
  listen 80;
  server_name tu-dominio.com;

  location / {
    allow 203.0.113.10;  # IP cliente
    allow 198.51.100.25; # IP admin
    deny all;

    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Notas:
- Si el cliente tiene IP dinamica, puede cambiar. En ese caso conviene usar VPN.
- Si usan Cloudflare, las IPs reales vienen en `CF-Connecting-IP`.

### Basic Auth (opcional)
Se puede agregar sin tocar el codigo, y es una capa extra.

## CORS
El backend usa `CORS_ORIGIN` para permitir solo los orígenes indicados.
Dejarlo en `localhost` durante pruebas y cambiarlo al dominio real en produccion.

## Despliegue y actualizaciones (VPS)

### Actualizar codigo desde Git
```
cd /projects/ariel
git pull
```

### Backend (PM2)
```
cd /projects/ariel/back
npm install
pm2 restart ariel-back
pm2 save
```

### Frontend (build estatico)
```
cd /projects/ariel/front
npm install
npm run build
cp -r build/* /var/www/sistemarenacer/
```

### Recargar Nginx
```
nginx -t
systemctl reload nginx
```

## Reset rapido (front + back)
```
pm2 restart ariel-back
cd /projects/ariel/front
npm run build
cp -r build/* /var/www/sistemarenacer/
nginx -t && systemctl reload nginx
```

## Restaurar base de datos en MariaDB
```
mysql -u root -p -e "DROP DATABASE IF EXISTS ariel_db;"
mysql -u root -p -e "CREATE DATABASE ariel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p ariel_db < /root/backup_con_indices.sql
```

Si el backup viene de MySQL, asegurarse de:
- No tener `GTID_PURGED`
- Usar collation compatible (`utf8mb4_unicode_ci`)
