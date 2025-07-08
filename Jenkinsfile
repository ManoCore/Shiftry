// pipeline {
//     agent any

//     triggers {
//         pollSCM('H/2 * * * *')
//     }

//     stages {
//         stage('Git Pull') {
//             steps {
//                 git credentialsId: 'github-token', url: 'https://github.com/ManoCore/Shiftry-Prod.git', branch: 'main'
//             }
//         }

//         stage('Sync to Web Folder') {
//             steps {
//                 sh 'rm -rf /var/www/Shiftry-Prod/*'
//                 sh 'cp -r . /var/www/Shiftry-Prod/'
//             }
//         }

//         stage('PM2 Restart') {
//             steps {
//                 sh '''
//                     cd /var/www/Shiftry-Prod
//                     sudo /root/.nvm/versions/node/v22.17.0/bin/pm2 restart all
//                 '''
//             }
//         }
//     }
// }


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
 
                    echo "Syncing project files (excluding .git)..."
                    rsync -av --exclude='.git' --exclude='node_modules' --no-perms --omit-dir-times ./ /var/www/Shiftry-Prod/
 
                    echo "Setting ownership to www-data..."
                    chown -R www-data:www-data /var/www/Shiftry-Prod
                '''
            }
        }
 
        stage('PM2 Restart') {
            steps {
                sh '''
                    echo "Restarting PM2 processes..."
                    cd /var/www/Shiftry-Prod
                    sudo /root/.nvm/versions/node/v22.17.0/bin/pm2 restart all
                '''
            }
        }
    }
}