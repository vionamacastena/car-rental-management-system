up:
	docker compose up -d

down:
	docker compose down

be:
	cd backend && php artisan serve

fe:
	cd frontend && npm run dev

migrate:
	cd backend && php artisan migrate

fresh:
	cd backend && php artisan migrate:fresh --seed

test-be:
	cd backend && ./vendor/bin/pest

test-fe:
	cd frontend && npm run test

lint-be:
	cd backend && ./vendor/bin/pint

lint-fe:
	cd frontend && npm run lint
