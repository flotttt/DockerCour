pipeline {
    agent any
    tools {
        nodejs "Node_24"
    }
    stages {
        stage('Build Frontend') {
            steps {
                sh 'docker-compose -p jenkins-test -f docker-compose.yml build frontend'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'docker-compose -p jenkins-test -f docker-compose.yml run --rm frontend npm test'
            }
        }
    }
}