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
                sh 'echo "Docker non disponible - test simulé"'
                sh 'ls -la'
            }
        }
    }
}