# defaults
src := dist
from := master
target := latest
message := Release: $(shell date)

help: Makefile
	@awk -F':.*?##' '/[a-z]+:.*##/{printf "\033[36m%-13s\033[0m %s\n",$$1,$$2}' $<

lint: src lib e2e deps ## Lint all sources
	@npm run lint

dev: src deps ## Start dev tasks  (nodejs)
	@npm run watch & npm run dev

e2e: src deps ## Run E2E locally  (nodejs)
	@BROWSER=$(browser) npm run test:e2e -- --debug-on-fail e2e/cases $(TESTCAFE_FLAGS)

ci: src deps ## Run tests on CI  (nodejs)
	@make e2e TESTCAFE_FLAGS="-a 'npm run dev'"

dist: src deps ## Build final output for production
	@(git worktree remove $(src) --force > /dev/null 2>&1) || true
	@git worktree add $(src) $(target)
	@cd $(src) && rm -rf *
	@npm run dist
	@mkdir $(src)/dist
	@mv $(src)/*.* $(src)/dist
	@cp -r lib index.js package*.json $(src)

push: $(src) ## Push built artifacts to github!
	@cd $(src) && git add . && git commit -m "$(message)"
	@git push origin $(target) -f

clean: ## Remove unwanted artifacts
	@rm -f dist/* .tarima

purge: ## Delete all installed modules
	@rm -rf node_modules/*

.PHONY: help lint dev test logs build clean dist node_modules
deps: node_modules
node_modules:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm i) || true
