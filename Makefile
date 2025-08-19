# ===== MAKEFILE BIBLIOFLOW - AUTOMATISATION DOCKER =====

.PHONY: help dev prod stop restart clean logs health test

# ===== AIDE =====
help: ## Affiche cette aide
	@echo "🚀 BIBLIOFLOW - Commandes Docker disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ===== DÉVELOPPEMENT =====
dev: ## Lance l'environnement de développement
	@echo "🚀 Lancement de l'environnement de développement..."
	docker compose up -d
	@echo "✅ Services démarrés !"
	@echo "🌐 Application: http://localhost"
	@echo "🔧 API: http://localhost/api/books"

dev-build: ## Reconstruit et lance l'environnement de développement
	@echo "🔨 Reconstruction des images..."
	docker compose up -d --build
	@echo "✅ Services reconstruits et démarrés !"

# ===== PRODUCTION =====
prod: ## Lance l'environnement de production
	@echo "🏭 Lancement de l'environnement de production..."
	docker compose -f docker-compose.yml up -d
	@echo "✅ Services de production démarrés !"

# ===== GESTION =====
stop: ## Arrête tous les services
	@echo "⏹️  Arrêt des services..."
	docker compose down
	@echo "✅ Services arrêtés !"

restart: ## Redémarre tous les services
	@echo "🔄 Redémarrage des services..."
	docker compose restart
	@echo "✅ Services redémarrés !"

# ===== MONITORING =====
logs: ## Affiche les logs de tous les services
	docker compose logs -f

logs-frontend: ## Affiche les logs du frontend
	docker compose logs -f frontend

logs-backend: ## Affiche les logs du backend
	docker compose logs -f backend

logs-nginx: ## Affiche les logs de nginx
	docker compose logs -f nginx

health: ## Vérifie l'état de santé des services
	@echo "🏥 Vérification de l'état des services..."
	@docker compose ps
	@echo ""
	@echo "🔍 Tests de connectivité:"
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost || echo "Frontend: ❌"
	@curl -s -o /dev/null -w "API: %{http_code}\n" http://localhost/api/books || echo "API: ❌"

# ===== NETTOYAGE =====
clean: ## Nettoie les containers et volumes
	@echo "🧹 Nettoyage des ressources Docker..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Nettoyage terminé !"

clean-all: ## Nettoie tout (images, containers, volumes, réseaux)
	@echo "🗑️  Nettoyage complet..."
	docker compose down -v --remove-orphans
	docker system prune -af
	docker volume prune -f
	@echo "✅ Nettoyage complet terminé !"

# ===== TESTS =====
test: ## Lance les tests de validation
	@echo "🧪 Lancement des tests de validation..."
	node test-formation-docker.js

test-quick: ## Test rapide de connectivité
	@echo "⚡ Test rapide de connectivité..."
	@curl -s http://localhost && echo "✅ Frontend OK" || echo "❌ Frontend KO"
	@curl -s http://localhost/api/books && echo "✅ API OK" || echo "❌ API KO"

# ===== MAINTENANCE =====
backup: ## Sauvegarde les données
	@echo "💾 Sauvegarde des données..."
	docker compose exec postgres pg_dump -U postgres biblioflow > backup_postgres_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Sauvegarde terminée !"

update: ## Met à jour les images Docker
	@echo "📥 Mise à jour des images..."
	docker compose pull
	docker compose up -d
	@echo "✅ Images mises à jour !"

# ===== DÉVELOPPEMENT AVANCÉ =====
shell-frontend: ## Ouvre un shell dans le container frontend
	docker compose exec frontend sh

shell-backend: ## Ouvre un shell dans le container backend
	docker compose exec backend sh

shell-postgres: ## Ouvre un shell PostgreSQL
	docker compose exec postgres psql -U postgres -d biblioflow

shell-mongodb: ## Ouvre un shell MongoDB
	docker compose exec mongodb mongosh

# ===== DEFAULT =====
.DEFAULT_GOAL := help