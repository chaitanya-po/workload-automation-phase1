pipeline {
    agent any

    stages {

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
                echo 'Waiting for backend to become ready...'

                bat 'powershell -NoProfile -Command "Start-Sleep -Seconds 10"'

                echo 'Performing health check...'

                bat 'powershell -NoProfile -Command "Invoke-RestMethod http://localhost:8000/api/health | ConvertTo-Json -Compress"'
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
