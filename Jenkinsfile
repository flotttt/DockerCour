pipeline {
    agent any
    tools {
        nodejs "Node_24"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/flotttt/DockerCour'
            }
        }
        stage('Build Frontend') {
            steps {
                sh 'docker compose -f compose.yml -f compose.ci.yml build frontend'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'docker compose -f compose.yml -f compose.ci.yml run --rm frontend npm run test:ci'
            }
        }
    }
}