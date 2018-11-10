MAKEFLAGS += --silent

.PHONY: install

install: ## Install dependencies
	docker-compose up -d
	docker exec -i atelierlp2_webserver_1 npm install
	docker exec -i atelierlp2_mongo_1 mongo test --eval "db.dropDatabase()"
	docker exec -i atelierlp2_mongo_1 mongoimport --db test --collection categories --file /app/data.json --jsonArray