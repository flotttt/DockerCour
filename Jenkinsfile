pipeline {
    agent any
    tools {
        nodejs "Node_24"
    }
    stages {
        stage('Build Frontend') {
            steps {
                sh 'docker-compose -f docker-compose.test.yml build frontend'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'docker-compose -f docker-compose.test.yml run --rm frontend npm run test -- --watch=false --browsers=ChromeHeadlessNoSandbox'
            }
        }
    }
}