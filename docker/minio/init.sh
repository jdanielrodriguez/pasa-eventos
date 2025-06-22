#!/bin/sh

# Esperar a que el servicio de MinIO esté listo
sleep 5

# Configurar alias para MinIO con la IP del contenedor
mc alias set local http://172.16.0.9:9000 pasaeventos pasaeventos

# Crear el bucket si no existe
mc mb local/local || true

# Configurar política pública para el bucket
mc policy set public local/local
