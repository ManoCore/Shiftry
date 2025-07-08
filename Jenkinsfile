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
 
//           }
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
                sh 'rm -rf /var/www/Shiftry-Prod/*'
                sh 'cp -r . /var/www/Shiftry-Prod/'
            }
        }
 
        // stage('PM2 Restart') {
        //     steps {
        //         sh '''
        //             cd /var/www/Shiftry-Prod
        //             pm2 restart all
        //         '''
        //     }
        // }
        stage('PM2 Restart') {
            steps {
                sh '''
                    cd /var/www/Shiftry-Prod
                    /root/.nvm/versions/node/v22.17.0/bin/pm2 restart all
                '''
            }
        }
    }
}