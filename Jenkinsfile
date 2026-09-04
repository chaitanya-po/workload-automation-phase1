pipeline {
    agent any

    stages {

        stage('Build Backend') {
            steps {
                echo 'Building the backend...'
                sh 'docker build -t workload-backend:1.0 ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building the frontend...'
                sh 'docker build -t workload-frontend:1.0 ./frontend'
            }
        }

        stage('Start Application') {
            steps {
                echo 'Starting the application...'
                sh 'docker compose up -d'
            }
        }

        stage('Verify Application') {
            steps {
                echo 'Verifying the application...'
                sh 'docker compose ps'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sh 'curl -f http://localhost:8000/api/health'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}