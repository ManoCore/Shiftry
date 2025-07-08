pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Git Pull') {
            steps {
                git credentialsId: 'github-token', url: 'https://github.com/ManoCore/Shiftry-Prod.git', branch: 'main'
            }
        }

        stage('Sync to Web Folder') {
            steps {
                sh '''
                    echo "Cleaning existing deployment..."
                    rm -rf /var/www/Shiftry-Prod/*

                    echo "Creating target directory..."
                    mkdir -p /var/www/Shiftry-Prod

                    echo "Copying project files (excluding .git and node_modules)..."
                    for item in * .*; do
                        if [ "$item" != "." ] && [ "$item" != ".." ] && [ "$item" != ".git" ] && [ "$item" != "node_modules" ]; then
                            cp -r "$item" /var/www/Shiftry-Prod/
                        fi
                    done

                '''
            }
        }

        stage('PM2 Restart') {
            steps {
                sh '''
                    echo "Restarting PM2 processes..."
                    cd /var/www/Shiftry-Prod

                    # Run pm2 restart without sudo. Make sure Jenkins has access to this pm2 path.
                    /root/.nvm/versions/node/v22.17.0/bin/pm2 restart all || true
                '''
            }
        }
    }
}
