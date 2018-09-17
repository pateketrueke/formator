CURRENT_DIRECTORY=./

BASE_COMPOSE=-f $(CURRENT_DIRECTORY)/docker/docker-compose.yml

help: Makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

dev: src docker ## Start dev tasks
	@docker-compose $(BASE_COMPOSE) up

dev-node: npm ## Start dev tasks with nodejs
	@npm run dev

dev-down: ## Clean up test environment
	@docker-compose $(BASE_COMPOSE) down

test: src docker ## Run tests for CI
	@docker-compose $(BASE_COMPOSE) up -d chrome
	@docker exec web_app_test /home/docker/run-tests.sh

bash: ## SSH into container
	@docker-compose $(BASE_COMPOSE) exec web-app /bin/bash

logs: ## Display docker logs
	@docker-compose $(BASE_COMPOSE) logs -f web-app

build: ## Build image for docker
	@docker-compose $(BASE_COMPOSE) build

clean: ## Remove all from node_modules/*
	@rm -rf node_modules/*

install: ## Setup user dependencies
	@npm i

# Ensure dependencies are installed before
npm: node_modules
node_modules: package*.json
	@make -s install
