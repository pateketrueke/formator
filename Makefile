help: Makefile
	@awk -F':.*?##' '/[a-z]+:.*##/{printf "\033[36m%-13s\033[0m %s\n",$$1,$$2}' $<

ci: dist ## Run tests on CI  (nodejs)
	@npm i json-schema-sequelizer
	@make -s test

lint: src lib e2e deps ## Lint all sources
	@npm run lint

dev: src deps ## Start dev tasks  (nodejs)
	@npm run watch & npm run dev

e2e: src deps ## Run E2E locally  (nodejs)
	@npm run test:e2e -- --debug-on-fail e2e/cases $(TESTCAFE_FLAGS)

live: src deps ## Live E2E session  (ndoejs)
	@make -s e2e TESTCAFE_FLAGS="--live --app-init-delay=500"

test: src deps ## Run tests on locally  (nodejs)
	@make e2e TESTCAFE_FLAGS="--color -a 'make dev'"

dist: src deps ## Build final output for production
	@npm run dist

clean: ## Remove unwanted artifacts
	@rm -rf $(src)/dist $(src)/lib .tarima

purge: ## Delete all installed modules
	@rm -rf node_modules/*

.PHONY: help lint dev test logs build clean dist node_modules
deps: node_modules
node_modules:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm i) || true
