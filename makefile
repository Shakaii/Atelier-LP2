MAKEFLAGS += --silent

.PHONY: install

install: ## Install dependencies
	npm install
	docker-compose up -d
	docker exec -i atelier-lp2_mongo_1 mongo test --eval "db.dropDatabase()"
	docker exec -i atelier-lp2_mongo_1 mongoimport --db test --collection categories --file /app/data.json --jsonArray
