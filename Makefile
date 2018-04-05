CURRENT_DIRECTORY=./

BASE_COMPOSE=-f $(CURRENT_DIRECTORY)/docker/docker-compose.yml

help: Makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

test: src docker ## Run tests
	@docker-compose $(BASE_COMPOSE) up -d chrome
	@docker exec web_app_test /home/docker/run-tests.sh

clean: ## Clean up env
	@docker-compose $(BASE_COMPOSE) down
