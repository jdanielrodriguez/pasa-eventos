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
- **Almacenamiento de archivos:** MinIO (compatible con S3).
- **Correo de pruebas:** Mailhog.
- **Admin DB:** phpMyAdmin.
- **Infraestructura:** Docker Compose para todos los servicios de desarrollo, con orquestación de redes y volúmenes personalizados.
- **CI/CD:** Listo para workflows independientes por servicio (backend, frontend), fácil integración con Github Actions y Google Cloud Run.

## 📦 Estructura de carpetas principal

```
.
├── api                 # Backend (Express/TypeScript)
├── docker              # Archivos Dockerfiles custom (node, minio, etc)
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

### 2. **Levantar todo el stack de desarrollo**

```sh
make init
```

Esto:
- Crea la red y volúmenes necesarios (si no existen).
- Construye las imágenes.
- Levanta todos los servicios: API, MySQL, Redis, MinIO, phpMyAdmin, Mailhog.

### 3. **Acceso rápido a servicios**

- **API Backend:** [http://localhost:3000](http://localhost:3000)
- **Health Check:** [http://localhost:3000/health](http://localhost:3000/health)
- **phpMyAdmin:** [http://localhost:8081](http://localhost:8081)
- **Mailhog:** [http://localhost:30250](http://localhost:30250)
- **MinIO UI:** [http://localhost:9001](http://localhost:9001)

### 4. **Shells y utilidades rápidas**

- Acceso a cada contenedor:

```sh
make node-shell
make db-shell
make redis-shell
make minio-shell
make phpmyadmin-shell
make mailhog-shell
```

## 🧪 Desarrollo y pruebas con Nx

### Ejecutar tareas Nx:

```sh
npx nx <target> <project-name>
```

Ejemplo, para el backend:

```sh
npx nx serve api        # Levanta la API en modo desarrollo (hot reload)
npx nx build api        # Compila la API a producción
npx nx test api         # Ejecuta los tests de la API
```

Puedes combinar Nx con Docker para pruebas integradas o usar Nx localmente.

## 🐳 Despliegue y ambientes

- **Desarrollo:**  
  Usa `docker-compose.local.yml` para levantar todo en tu máquina con hot reload.
- **Producción y test:**  
  Se recomienda crear archivos `docker-compose.prod.yml` o `docker-compose.test.yml` adaptados para tu entorno (ver ejemplos en `/docker`).

## 💡 Tips y mejores prácticas

- **Volúmenes:** El volumen `/app/node_modules` permite mantener dependencias aisladas por contenedor y facilita el hot reload.
- **Variables de entorno:** Usa archivos `.env` según ambiente y expórtalos en tu compose o workflows.
- **Nx:** Usa `npx nx graph` para visualizar dependencias entre proyectos y librerías.
- **Extensiones recomendadas:** [Nx Console](https://nx.dev/getting-started/editor-setup) para autocompletado y generación de código desde tu IDE.

## 📚 Documentación y recursos

- [Documentación oficial Nx](https://nx.dev/)
- [Express + TypeScript Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)

---

¿Dudas o sugerencias?  
Cualquier mejora o issue, por favor abre un [issue](https://github.com/jdanielrodriguez/tikettera/issues) o contacta a los administradores del repo.

---
