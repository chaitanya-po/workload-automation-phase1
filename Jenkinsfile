pipeline {
    agent any

    environment {
        KUBECONFIG = 'C:\\ProgramData\\Jenkins\\kind-kubeconfig.yaml'
        KIND_EXE = 'C:\\Users\\chaitanya\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Kubernetes.kind_Microsoft.Winget.Source_8wekyb3d8bbwe\\kind.exe'
    }

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

        stage('Load Images into KIND') {
            steps {
                echo 'Loading Docker images into KIND...'

                bat '"%KIND_EXE%" load docker-image workload-backend:1.0 --name workload-cluster'
                bat '"%KIND_EXE%" load docker-image workload-frontend:1.0 --name workload-cluster'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying application to Kubernetes...'

                bat 'kubectl apply -f k8s/namespace.yaml'
                bat 'kubectl apply -f k8s/postgres.yaml'
                bat 'kubectl apply -f k8s/backend.yaml'
                bat 'kubectl apply -f k8s/frontend.yaml'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying Kubernetes deployment...'

                bat 'kubectl rollout status deployment/postgres -n workload-automation --timeout=180s'
                bat 'kubectl rollout status deployment/backend -n workload-automation --timeout=180s'
                bat 'kubectl rollout status deployment/frontend -n workload-automation --timeout=180s'

                bat 'kubectl get pods -n workload-automation'
                bat 'kubectl get services -n workload-automation'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking deployed application...'

                bat 'kubectl get pods -n workload-automation'
                bat 'kubectl get services -n workload-automation'

                echo 'Checking backend API health...'

                bat 'kubectl run health-check --rm -i --restart=Never -n workload-automation --image=curlimages/curl:8.10.1 -- curl -f http://backend:8000/api/health'
            }
        }
    }

    post {
        success {
            echo 'Kubernetes deployment completed successfully!'
        }

        failure {
            echo 'Kubernetes deployment failed. Please check the logs.'
        }
    }
}
