PWD=$(shell pwd)
BASE_COMPOSE=-f $(PWD)/docker/docker-compose.yml

help: Makefile
	@awk -F':.*?##' '/[a-z]+:.*##/{printf "\033[36m%-13s\033[0m %s\n",$$1,$$2}' $<

lint: src ## Lint all sources
	@npm run lint

node: ## Start dev tasks (nodejs)
	@npm run dev

dist: ## Build final output for production
	@npm run dist

dev: src docker ## Start dev tasks (docker)
	@docker-compose $(BASE_COMPOSE) up

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
	@rm -rf dist node_modules/*

# Ensure dependencies are installed before
.PHONY: help lint dev node dev-down test bash logs build clean dist
