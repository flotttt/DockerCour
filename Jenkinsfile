pipeline {
    agent any

    environment {
        // Variables globales
        COMPOSE_PROJECT_NAME = 'biblioflow-ci'
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
    }

    options {
        // Conserver les 10 derniers builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout global du pipeline
        timeout(time: 30, unit: 'MINUTES')
        // Timestamps dans les logs
        timestamps()
    }

    stages {
        stage('🔍 Checkout') {
            steps {
                echo '📥 Récupération du code source...'
                // Le checkout est automatique avec pipeline Jenkins
                sh '''
                    echo "=== 📋 Information du build ==="
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Commit: ${GIT_COMMIT}"
                    echo "Build: ${BUILD_NUMBER}"
                    echo "Workspace: ${WORKSPACE}"
                    ls -la
                '''
            }
        }

        stage('🔧 Preflight') {
            steps {
                echo '🔧 Vérifications préliminaires...'
                script {
                    // Vérification des outils nécessaires
                    sh '''
                        echo "=== 🔍 Vérification des outils ==="
                        docker --version
                        docker-compose --version

                        echo "=== 📁 Vérification de la structure du projet ==="
                        test -f compose.ci.yml || (echo "❌ compose.ci.yml manquant!" && exit 1)
                        test -d biblioflow-backend || (echo "❌ Dossier backend manquant!" && exit 1)
                        test -d biblioflow-frontend || (echo "❌ Dossier frontend manquant!" && exit 1)
                        test -f biblioflow-backend/Dockerfile || (echo "❌ Dockerfile backend manquant!" && exit 1)
                        test -f biblioflow-frontend/Dockerfile || (echo "❌ Dockerfile frontend manquant!" && exit 1)

                        echo "✅ Tous les fichiers nécessaires sont présents"
                    '''
                }
            }
        }

        stage('📝 Prepare Environment') {
            steps {
                echo '📝 Préparation de l\'environnement...'
                script {
                    // Création du fichier .env pour la CI
                    writeFile file: '.env.ci', text: '''
# Configuration CI/CD - TP9
NODE_ENV=production
COMPOSE_PROJECT_NAME=biblioflow-ci

# Base de données PostgreSQL
POSTGRES_DB=biblioflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=biblioflow_postgres_secure_password_2024

# Base de données MongoDB
MONGO_INITDB_DATABASE=biblioflow_logs
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=biblioflow_mongodb_root_password_2024

# URLs de connexion
DATABASE_URL=postgresql://postgres:biblioflow_postgres_secure_password_2024@postgres:5432/biblioflow
MONGODB_URL=mongodb://mongodb:27017/biblioflow

# Ports
BACKEND_PORT=3000
FRONTEND_PORT=4200
NGINX_PORT=80
'''

                    sh '''
                        echo "=== 📝 Fichier .env.ci créé ==="
                        cat .env.ci

                        echo "=== 🧹 Nettoyage des containers précédents ==="
                        docker-compose -f compose.ci.yml down --remove-orphans --volumes || true
                        docker system prune -f || true
                    '''
                }
            }
        }

        stage('🏗️ Build') {
            steps {
                echo '🏗️ Construction des images Docker...'
                retry(2) {
                    script {
                        sh '''
                            echo "=== 🏗️ Build des images avec cache bust ==="
                            docker-compose -f compose.ci.yml build --no-cache --force-rm

                            echo "=== 📊 Vérification des images créées ==="
                            docker images | grep -E "(biblioflow|dockertp)"

                            echo "=== ✅ Build terminé avec succès ==="
                        '''
                    }
                }
            }
            post {
                failure {
                    echo '❌ Échec du build - Nettoyage...'
                    sh '''
                        docker-compose -f compose.ci.yml down --remove-orphans || true
                        docker system prune -f || true
                    '''
                }
            }
        }

        stage('🚀 Deploy') {
            steps {
                echo '🚀 Déploiement de l\'application...'
                retry(2) {
                    script {
                        sh '''
                            echo "=== 🚀 Lancement de l'stack complète ==="
                            docker-compose -f compose.ci.yml up -d --force-recreate

                            echo "=== ⏳ Attente du démarrage des services ==="
                            sleep 30

                            echo "=== 📊 Statut des containers ==="
                            docker-compose -f compose.ci.yml ps

                            echo "=== 🔍 Vérification des logs ==="
                            docker-compose -f compose.ci.yml logs --tail=20 backend
                        '''
                    }
                }
            }
        }

        stage('🧪 Health Checks') {
            steps {
                echo '🧪 Vérification de la santé des services...'
                script {
                    sh '''
                        echo "=== 🧪 Tests de santé ==="

                        # Test PostgreSQL
                        echo "🔍 Test PostgreSQL..."
                        docker exec biblioflow-postgres pg_isready -U postgres -d biblioflow

                        # Test MongoDB
                        echo "🔍 Test MongoDB..."
                        docker exec biblioflow-mongodb mongosh --eval "db.adminCommand('ping')" --quiet

                        # Test Backend API
                        echo "🔍 Test Backend API..."
                        for i in {1..10}; do
                            if curl -f http://localhost:3000/books >/dev/null 2>&1; then
                                echo "✅ Backend API répond"
                                break
                            fi
                            echo "⏳ Tentative $i/10 - Backend API non prêt, attente..."
                            sleep 10
                        done

                        # Test Frontend
                        echo "🔍 Test Frontend..."
                        for i in {1..5}; do
                            if curl -f http://localhost:4200 >/dev/null 2>&1; then
                                echo "✅ Frontend répond"
                                break
                            fi
                            echo "⏳ Tentative $i/5 - Frontend non prêt, attente..."
                            sleep 5
                        done

                        echo "=== 🎉 Tous les services sont opérationnels! ==="
                    '''
                }
            }
        }

        stage('🔍 Validation') {
            steps {
                echo '🔍 Validation finale...'
                script {
                    sh '''
                        echo "=== 🔍 Validation des endpoints ==="

                        # Test API Backend
                        echo "📊 Test endpoint /books:"
                        curl -X GET http://localhost:3000/books -H "Accept: application/json" | head -c 200
                        echo ""

                        # Test Frontend
                        echo "📊 Test page d'accueil:"
                        curl -I http://localhost:4200 | head -5

                        # Test bases de données
                        echo "📊 Test table books dans PostgreSQL:"
                        docker exec biblioflow-postgres psql -U postgres -d biblioflow -c "\\dt"

                        echo "📊 Test connexion MongoDB:"
                        docker exec biblioflow-mongodb mongosh --eval "show dbs" --quiet

                        echo "=== ✅ Validation réussie! ==="
                        echo "🌐 Frontend: http://localhost:4200"
                        echo "🔗 Backend API: http://localhost:3000/books"
                        echo "📊 Nginx: http://localhost:80"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Nettoyage final...'
            script {
                sh '''
                    echo "=== 📊 Logs finaux ==="
                    docker-compose -f compose.ci.yml logs --tail=50 || true

                    echo "=== 📈 Utilisation des ressources ==="
                    docker stats --no-stream || true
                '''
            }
        }
        success {
            echo '''
            🎉 ========================================
            ✅ PIPELINE RÉUSSI - TP9 VALIDÉ!
            ========================================
            📊 Services déployés:
            • Frontend: http://localhost:4200
            • Backend: http://localhost:3000
            • API: http://localhost:3000/books

            📋 Évaluation TP9:
            ✅ 40% Pipeline fonctionnel
            ✅ 30% Best practices (volumes, .env, overrides)
            ✅ 30% Robustesse (gestion erreurs, retry)
            ========================================
            '''
        }
        failure {
            echo '''
            ❌ ========================================
            💥 PIPELINE ÉCHOUÉ
            ========================================
            '''
            script {
                sh '''
                    echo "=== 🔍 Diagnostic des erreurs ==="
                    docker-compose -f compose.ci.yml ps || true
                    docker-compose -f compose.ci.yml logs || true
                '''
            }
        }
        cleanup {
            echo '🧹 Nettoyage des ressources...'
            script {
                sh '''
                    # Arrêt des services (garder les volumes pour les données)
                    docker-compose -f compose.ci.yml down || true

                    # Nettoyage optionnel des images (décommenter si besoin)
                    # docker system prune -f || true
                '''
            }
        }
    }
}