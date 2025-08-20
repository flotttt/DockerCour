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
        stage('Test Frontend') {
            steps {
                // Utilise le conteneur frontend déjà en cours
                sh 'docker exec biblioflow-frontend npm test'
            }
        }
    }
}