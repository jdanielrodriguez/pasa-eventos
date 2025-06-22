# Pasaeventos

Plataforma moderna para la venta y compra de boletos para eventos, desarrollada bajo una arquitectura monorepo con [Nx](https://nx.dev/), [TypeScript](https://www.typescriptlang.org/), Docker y mejores prácticas de calidad y despliegue continuo.

## 🚀 ¿Qué es este proyecto?

**Pasaeventos** es un sistema digital orientado a facilitar la gestión, promoción, venta y validación de entradas para todo tipo de eventos, con enfoque en escalabilidad y calidad desde el día uno.  
Este repositorio es el *core* backend y orquestador de servicios, completamente dockerizado, ideal para desarrollo local, pruebas, y despliegue en la nube.

## 🏗️ Arquitectura y tecnologías

- **Monorepo Nx:** Todo el código fuente (backend, frontend y librerías compartidas) en un solo repositorio, facilitando el versionado y la colaboración.
- **Backend:** Node.js + Express + TypeScript.
- **Base de datos:** MySQL 8.
- **Cache y colas:** Redis.
- **Almacenamiento de archivos:** MinIO (compatible con S3, configurable vía .env).
- **Correo de pruebas:** Mailhog (configurable vía .env).
- **Admin DB:** phpMyAdmin.
- **Infraestructura:** Docker Compose para todos los servicios de desarrollo, con orquestación de redes y volúmenes personalizados.
- **CI/CD:** Listo para workflows independientes por servicio (backend, frontend), fácil integración con Github Actions y Google Cloud Run.
- **Testing:** Jest + Supertest (integración/unidad), cobertura automática, y teardown de recursos global.
- **Documentación interactiva:** Swagger en `/docs`.

## 📦 Estructura de carpetas principal

```
.
├── api                 # Backend (Express/TypeScript)
│   └── src
│       ├── config
│       ├── controllers
│       ├── middlewares
│       ├── models
│       ├── repositories
│       ├── routes
│       ├── services
│       ├── test         # Unit & integration tests
│       └── utils
├── docker              # Dockerfiles custom (node, minio, etc)
├── docker-compose.local.yml
├── Makefile            # Tareas para devops y automatización
├── package.json        # Dependencias monorepo y scripts Nx
├── nx.json             # Configuración Nx
└── ...                 # Otros servicios/libs/comandos
```

## ⚡ Primeros pasos

### 1. **Pre-requisitos**

- [Docker](https://www.docker.com/get-started/)
- [Node.js 20+](https://nodejs.org/) (para scripts Nx locales)
- [Nx CLI (opcional)](https://nx.dev/cli)

### 2. **Configuración del entorno**

Copia `.env.example` a `.env` y personaliza según tu entorno:

```
cp .env.example .env
```

Ejemplo de variables (dev/prod):

```
# General
NODE_ENV=development
PORT=8080

# MySQL
MYSQL_HOST=pasaeventos_db
MYSQL_PORT=3306
MYSQL_USER=pasaeventos
MYSQL_PASSWORD=1234
MYSQL_DATABASE=pasaeventos

# Redis
REDIS_HOST=pasaeventos_redis
REDIS_PORT=6379

# FileManager (MinIO/S3)
FILEMANAGER_PROVIDER=minio
MINIO_ENDPOINT=172.16.0.9
MINIO_PORT=9000
MINIO_ROOT_USER=pasaeventos
MINIO_ROOT_PASSWORD=pasaeventos
# En prod:
# FILEMANAGER_PROVIDER=s3
# S3_REGION=us-east-1
# S3_ACCESS_KEY_ID=...
# S3_SECRET_ACCESS_KEY=...

# Mail (SMTP)
MAIL_HOST=pasaeventos_mailhog
MAIL_PORT=1025
MAIL_USER=
MAIL_PASS=
# En prod usar SMTP real
```

### 3. **Levantar todo el stack de desarrollo**

```
make init
```

Esto:
- Crea la red y volúmenes necesarios (si no existen).
- Construye las imágenes.
- Levanta todos los servicios: API, MySQL, Redis, FileManager (MinIO/S3), phpMyAdmin, Mailhog.

### 4. **Acceso rápido a servicios**

- **API Backend:** [http://localhost:8080](http://localhost:8080)
- **Health Check:** [http://localhost:8080/health](http://localhost:8080/health)
- **Swagger Docs:** [http://localhost:8080/docs](http://localhost:8080/docs)
- **phpMyAdmin:** [http://localhost:8081](http://localhost:8081)
- **Mailhog:** [http://localhost:30250](http://localhost:30250)
- **MinIO UI:** [http://localhost:9001](http://localhost:9001)

### 5. **Shells y utilidades rápidas**

- Acceso a cada contenedor:

```sh
make node-shell
make db-shell
make redis-shell
make minio-shell
make phpmyadmin-shell
make mailhog-shell
```

## 🧪 Desarrollo, testing y coverage con Nx

### Ejecutar tareas Nx:

```sh
npx nx <target> <project-name>
```

Ejemplo, para el backend:

```
npx nx serve api        # Levanta la API en modo desarrollo (hot reload)
npx nx build api        # Compila la API a producción
npx nx test api         # Ejecuta los tests de la API y coverage
```

### Ver el reporte de coverage

Tras ejecutar los tests, puedes visualizar el coverage ejecutando:

```sh
npx serve api/coverage/api -l 3000
```

Luego abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📝 Configuración avanzada y mejores prácticas

- **Variables de entorno:** Usa archivos `.env` según ambiente (`.env`, `.env.prod`, etc) y expórtalos en tus scripts/docker/workflows.
- **Testing:** Todos los tests están en `/api/src/test` para máxima compatibilidad con Nx/Jest. El cierre de conexiones es automático gracias a hooks globales.
- **Swagger:** Toda la documentación está disponible y autocontenida en `/docs` y se actualiza con los decoradores y anotaciones JSDoc en tus rutas/controllers.
- **Nx:** Usa `npx nx graph` para visualizar dependencias entre proyectos y librerías.
- **Extensiones recomendadas:** [Nx Console](https://nx.dev/getting-started/editor-setup) para autocompletado y generación de código desde tu IDE.

## 🐳 Despliegue y ambientes

- **Desarrollo:**  
  Usa `docker-compose.local.yml` para levantar todo en tu máquina con hot reload.
- **Producción y test:**  
  Se recomienda crear archivos `docker-compose.prod.yml` o `docker-compose.test.yml` adaptados para tu entorno (ver ejemplos en `/docker`).
- **CI/CD:**  
  Integrado con Github Actions, fácil despliegue a Google Cloud Run.

## 📚 Documentación y recursos

- [Documentación oficial Nx](https://nx.dev/)
- [Express + TypeScript Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)
- [Swagger UI Docs](https://swagger.io/tools/swagger-ui/)

## ❓ FAQ y problemas comunes

- **No se ven los tests:**  
  Asegúrate que los tests estén en `/api/src/test` y que el patrón `testMatch` esté correcto en el jest.config.
- **No cierra Jest después de los tests:**  
  Verifica que el `afterAll` de tu setup cierre todas las conexiones (MySQL, Redis, etc).
- **Swagger no muestra rutas:**  
  Confirma que tus anotaciones JSDoc estén en las rutas y que el build esté actualizado.
- **Error de variables de entorno:**  
  Asegúrate que tu `.env` esté presente y bien configurado, o revisa los defaults en `/api/src/config/api.ts`.

---

¿Dudas o sugerencias?  
Cualquier mejora o issue, por favor abre un [issue](https://github.com/jdanielrodriguez/tikettera/issues) o contacta a los administradores del repo.

---
