pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out the code...'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Building the backend...'
                bat 'docker build -t workload-backend:1.0 ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building the frontend...'
                bat 'docker build -t workload-frontend:1.0 ./frontend'
            }
        }

        stage('Start Application') {
            steps {
                echo 'Starting the application...'
                bat 'docker compose up -d'
            }
        }

        stage('Verify Application') {
            steps {
                echo 'Verifying the application...'
                bat 'docker compose ps'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                bat 'powershell -Command "Invoke-RestMethod http://localhost:8000/api/health"'
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