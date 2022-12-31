BASE_URL=http://localhost:8080
BROWSER=chrome:headless

.EXPORT_ALL_VARIABLES:

help: Makefile
	@awk -F':.*?##' '/[a-z]+:.*##/{printf "\033[36m%-13s\033[0m %s\n",$$1,$$2}' $<

ci: dist ## Run tests on CI  (nodejs)
	@npx testcafe $(BROWSER) e2e/cases --color -q -a 'make dev >/dev/null 2>&1'

e2e: src deps ## Run E2E locally  (nodejs)
	@npm run test:e2e -- --debug-on-fail e2e/cases $(TESTCAFE_FLAGS)

lint: src lib e2e deps ## Lint all sources
	@npm run lint

dev: src deps ## Start dev tasks  (nodejs)
	@mkdir -p tmp
	@npm run build
	@npm run dev & npm start

dist: src deps ## Build final output for production
	@npm run build -- -f

clean: ## Remove unwanted artifacts
	@rm -rf dist/* tmp/* cache.json

purge: ## Delete all installed modules
	@rm -rf node_modules/*

release: deps
ifneq ($(CI),)
	@echo '//registry.npmjs.org/:_authToken=$(NODE_AUTH_TOKEN)' > .npmrc
	@npm version $(USE_RELEASE_VERSION)
endif

.PHONY: help lint dev test logs build clean dist release node_modules
deps: node_modules
node_modules:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm i) || true
