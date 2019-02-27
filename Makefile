PWD=$(shell pwd)
BASE_COMPOSE=-f $(PWD)/docker/docker-compose.yml

help: Makefile
	@awk -F':.*?##' '/[a-z]+:.*##/{printf "\033[36m%-13s\033[0m %s\n",$$1,$$2}' $<

lint: src lib tests ## Lint all sources
	@npm run lint

dev: src ## Start dev tasks (nodejs)
	@npm run dev

dist: src ## Build final output for production
	@npm run dist

test: docker ## Run tests for CI
	@docker-compose $(BASE_COMPOSE) up -d chrome
	@docker exec web_app_test /home/docker/run-tests.sh

logs: ## Display docker logs
	@docker-compose $(BASE_COMPOSE) logs -f

build: ## Build image for docker
	@docker-compose $(BASE_COMPOSE) build

clean: ## Remove unwanted artifacts
	@rm -rf dist node_modules/*

.PHONY: help lint dev test logs build clean dist
