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
                dir('biblioflow-frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        stage('Test Frontend') {
            steps {
                dir('biblioflow-frontend') {
                    sh 'npm test'
                }
            }
        }
    }
}