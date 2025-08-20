pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Déjà fait automatiquement
                echo 'Code récupéré depuis GitHub'
            }
        }

        stage('Preflight') {
            steps {
                sh 'docker --version'
                sh 'docker-compose --version'
                sh 'ls -la'
            }
        }

        stage('Prepare .env') {
            steps {
                sh 'cp .env.example .env || echo "Using existing .env"'
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose -f compose.yml -f compose.ci.yml build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose -f compose.yml -f compose.ci.yml up -d'
            }
        }
    }

    post {
        failure {
            sh 'docker-compose -f compose.yml -f compose.ci.yml logs'
        }
        cleanup {
            sh 'docker-compose -f compose.yml -f compose.ci.yml down || true'
        }
    }
}