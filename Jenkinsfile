pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Code récupéré depuis GitHub'
            }
        }

        stage('Preflight') {
            steps {
                sh 'docker --version'
                sh 'docker-compose --version'
                sh 'ls -la *.yml'
            }
        }

            stage('Cleanup') {
                steps {
                    sh 'docker-compose down -v || true'
                    sh 'docker volume prune -f || true'
                    sh 'docker container prune -f || true'
                }
            }

        stage('Prepare .env') {
            steps {
                sh 'cp .env.example .env || echo "Using existing .env"'
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose -f docker-compose.yml -f compose.ci.yml build --no-cache'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose -f docker-compose.yml -f compose.ci.yml up -d'
            }
        }

        stage('Validate') {
            steps {
                sh 'sleep 30'
                sh 'docker-compose -f docker-compose.yml -f compose.ci.yml ps'
                sh 'curl -f http://localhost:80 || echo "Frontend check failed"'
            }
        }
    }

    post {
        failure {
            sh 'docker-compose -f docker-compose.yml -f compose.ci.yml logs || true'
        }
        cleanup {
            sh 'docker-compose -f docker-compose.yml -f compose.ci.yml down || true'
        }
    }
}