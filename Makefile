.PHONY: start
start:
	docker-compose -f docker-compose.local.yml up -d

.PHONY: stop
stop:
	docker-compose -f docker-compose.local.yml stop

.PHONY: stop-test
stop-test:
	docker-compose -f docker-compose.test.yml stop

.PHONY: network-create
network-create:
	docker network create --gateway 172.16.0.1 --subnet 172.16.0.0/24 pasaeventos_network

.PHONY: network-remove
network-remove:
	docker network rm pasaeventos_network

.PHONY: init
init:
	docker network inspect pasaeventos_network >/dev/null 2>&1 || docker network create --subnet=172.16.0.0/24 pasaeventos_network
	docker volume inspect pasaeventos_db_data >/dev/null 2>&1 || docker volume create pasaeventos_db_data
	docker volume inspect pasaeventos_redis_data >/dev/null 2>&1 || docker volume create pasaeventos_redis_data
	docker volume inspect pasaeventos_minio_data >/dev/null 2>&1 || docker volume create pasaeventos_minio_data
	docker-compose -f docker-compose.local.yml build
	docker-compose -f docker-compose.local.yml up -d

.PHONY: init-test
init-test:
	@echo "Initializing environment (network, volumes, and services for testing)..."
	docker network inspect pasaeventos_network >/dev/null 2>&1 || docker network create --subnet=172.16.0.0/24 pasaeventos_network
	docker volume inspect pasaeventos_db_data >/dev/null 2>&1 || docker volume create pasaeventos_db_data
	docker volume inspect pasaeventos_redis_data >/dev/null 2>&1 || docker volume create pasaeventos_redis_data
	docker volume inspect pasaeventos_minio_data >/dev/null 2>&1 || docker volume create pasaeventos_minio_data
	docker compose -f docker-compose.local.yml -f docker-compose.test.yml build
	docker compose -f docker-compose.local.yml -f docker-compose.test.yml up -d

.PHONY: test
test:
	docker exec pasaeventos_api npx nx test api --coverage

.PHONY: deploy
deploy:
	@echo "Authenticating and deploying to Google Cloud Run..."
	gcloud auth activate-service-account --key-file gcp-service-account.json
	gcloud config set project pasa-eventos
	gcloud builds submit --tag us-central1-docker.pkg.dev/pasa-eventos/pasaeventos-backend/api:latest .
	gcloud run deploy pasaeventos-api \
		--image us-central1-docker.pkg.dev/pasa-eventos/pasaeventos-backend/api:latest \
		--region us-central1 \
		--platform managed \
		--allow-unauthenticated

.PHONY: test-all monorepo
test-all:
	docker exec pasaeventos_api npx nx test

.PHONY: rebuild
rebuild:
	docker-compose -f docker-compose.local.yml up --build --force-recreate -d

.PHONY: node-restart
node-restart:
	docker stop pasaeventos_api
	docker start pasaeventos_api

.PHONY: node-shell
node-shell:
	docker exec -it pasaeventos_api /bin/bash

.PHONY: db-shell
db-shell:
	docker exec -it pasaeventos_db /bin/bash

.PHONY: redis-shell
redis-shell:
	docker exec -it pasaeventos_redis /bin/bash

.PHONY: minio-shell
minio-shell:
	docker exec -it pasaeventos_minio /bin/sh

.PHONY: phpmyadmin-shell
phpmyadmin-shell:
	docker exec -it pasaeventos_phpmyadmin /bin/sh

.PHONY: mailhog-shell
mailhog-shell:
	docker exec -it pasaeventos_mailhog /bin/sh
