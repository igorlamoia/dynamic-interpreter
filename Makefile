LOCAL_COMPOSE := docker compose --env-file /dev/null -f docker-compose.local.yml

.PHONY: local-up local-down local-logs local-status local-reset

local-up:
	$(LOCAL_COMPOSE) up --build --detach

local-down:
	$(LOCAL_COMPOSE) down

local-logs:
	$(LOCAL_COMPOSE) logs --follow

local-status:
	$(LOCAL_COMPOSE) ps

local-reset:
	$(LOCAL_COMPOSE) down --volumes
