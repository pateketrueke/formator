PWD=$(shell pwd)
BASE_COMPOSE=-f $(PWD)/docker/docker-compose.yml

help: Makefile
	@awk -F':.*?##' '/[a-z]+:.*##/{printf "\033[36m%-13s\033[0m %s\n",$$1,$$2}' $<

lint: src lib tests node_modules ## Lint all sources
	@npm run lint

dev: src node_modules ## Start dev tasks (nodejs)
	@npm run dev

dist: src node_modules ## Build final output for production
	@npm run dist

test: docker ## Run tests for CI
	@docker-compose $(BASE_COMPOSE) up -d chrome
	@docker exec web_app_test /home/docker/run-tests.sh

logs: ## Display docker logs
	@docker-compose $(BASE_COMPOSE) logs -f

build: ## Build image for docker
	@docker-compose $(BASE_COMPOSE) build

clean: ## Remove unwanted artifacts
	@rm -rf dist

purge: ## Delete all installed modules
	@rm -rf node_modules/*

.PHONY: help lint dev test logs build clean dist node_modules
node_modules:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm i) || true
