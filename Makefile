PWD=$(shell pwd)
BASE_COMPOSE=-f $(PWD)/docker/docker-compose.yml

# defaults
src := dist
from := master
target := latest
message := Release: $(shell date)

help: Makefile
	@awk -F':.*?##' '/[a-z]+:.*##/{printf "\033[36m%-13s\033[0m %s\n",$$1,$$2}' $<

lint: src lib tests node_modules ## Lint all sources
	@npm run lint

dev: src node_modules ## Start dev tasks (nodejs)
	@npm run dev

dist: src node_modules ## Build final output for production
	@(git worktree remove $(src) --force > /dev/null 2>&1) || true
	@git worktree add $(src) $(target)
	@cd $(src) && git clean -fdx
	@npm run dist && mkdir $(src)/dist
	@mv $(src)/*.* $(src)/dist && cp -r lib package*.json $(src)

push: $(src) ## Push built artifacts to github!
	@cd $(src) && git add . && git commit -m "$(message)"
	@git push origin $(target) -f

test: docker ## Run tests for CI
	@docker-compose $(BASE_COMPOSE) up -d chrome
	@docker exec web_app_test /home/docker/run-tests.sh

logs: ## Display docker logs
	@docker-compose $(BASE_COMPOSE) logs -f

build: ## Build image for docker
	@docker-compose $(BASE_COMPOSE) build

clean: ## Remove unwanted artifacts
	@rm -rf dist .tarima

purge: ## Delete all installed modules
	@rm -rf node_modules/*

.PHONY: help lint dev test logs build clean dist node_modules
node_modules:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm i) || true
