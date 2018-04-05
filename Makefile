CURRENT_DIRECTORY=./

BASE_COMPOSE=-f $(CURRENT_DIRECTORY)/docker/docker-compose.yml

help: Makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

dev: src docker ## Start dev tasks
	@docker-compose $(BASE_COMPOSE) up

test: src docker ## Run tests for CI
	@docker-compose $(BASE_COMPOSE) up -d chrome
	@docker exec web_app_test /home/docker/run-tests.sh

bash: ## SSH into container
	@docker-compose $(BASE_COMPOSE) exec web-app /bin/bash

logs: ## Display docker logs
	@docker-compose $(BASE_COMPOSE) logs -f web-app

build: ## Build image for docker
	@docker-compose $(BASE_COMPOSE) build

clean: ## Clean up test environment
	@docker-compose $(BASE_COMPOSE) down
