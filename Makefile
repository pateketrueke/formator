CURRENT_DIRECTORY=./

BASE_COMPOSE=-f $(CURRENT_DIRECTORY)/docker/docker-compose.yml

help: Makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

dev: src docker ## Start dev tasks (docker)
	@docker-compose $(BASE_COMPOSE) up

dev-node: npm ## Start dev tasks (nodejs)
	@npm run dev

dev-down: ## Clean up environment
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

clean: ## Remove unwanted artifacts
	@rm -rf dist node_modules

dist: clean npm ## Build final output for production
	@npm run dist

# Ensure dependencies are installed before
npm: node_modules
node_modules: package*.json
	@npm i
