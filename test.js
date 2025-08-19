#!/usr/bin/env node

/**
 * ===== SCRIPT VALIDATION GLOBALE FORMATION DOCKER =====
 * Test complet de tous les TP (TP1 à TP6)
 *
 * Usage: node test-formation-docker.js
 * Ou: npm test (si configuré dans package.json)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration globale
const CONFIG = {
    baseUrl: 'http://localhost',
    apiUrl: 'http://localhost/api',
    frontendUrl: 'http://localhost:4200',
    backendUrl: 'http://localhost:3000',
    timeout: 10000,
    retries: 3
};

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

// Résultats globaux
let globalResults = {
    tp1: { score: 0, total: 100, name: 'TP1 - Premiers Conteneurs', tests: [] },
    tp2: { score: 0, total: 100, name: 'TP2 - Images et Dockerfiles', tests: [] },
    tp3: { score: 0, total: 100, name: 'TP3 - Volumes et Réseaux', tests: [] },
    tp4: { score: 0, total: 100, name: 'TP4 - Bases de Données', tests: [] },
    tp5: { score: 0, total: 100, name: 'TP5 - Docker Compose Multi-Services (NOTÉ)', tests: [] },
    tp6: { score: 0, total: 100, name: 'TP6 - Hot Reload Développement', tests: [] }
};

// Utilitaires de logging
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
    log(`\n${colors.bgBlue}${colors.white} ${message} ${colors.reset}`, 'bright');
    log('=' .repeat(60), 'blue');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logBonus(message) {
    log(`🌟 ${message}`, 'magenta');
}

// Fonction pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        const request = protocol.request(url, options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    data: data
                });
            });
        });

        request.on('error', reject);
        request.setTimeout(CONFIG.timeout, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            request.write(options.body);
        }

        request.end();
    });
}

// Fonction pour exécuter des commandes Docker
async function execDocker(command) {
    try {
        const { stdout, stderr } = await execAsync(command, { timeout: 15000 });
        return { success: true, stdout, stderr };
    } catch (error) {
        return { success: false, error: error.message, stdout: error.stdout || '', stderr: error.stderr || '' };
    }
}

// Fonction pour vérifier l'existence de fichiers
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

// ===== TP1 - PREMIERS CONTENEURS =====
async function testTP1() {
    logHeader('TP1 - PREMIERS CONTENEURS');

    const tests = [
        {
            name: 'Docker installé et fonctionnel',
            test: async () => {
                const result = await execDocker('docker --version');
                return result.success && result.stdout.includes('Docker version');
            },
            points: 20
        },
        {
            name: 'Docker Compose installé',
            test: async () => {
                // Test d'abord la nouvelle syntaxe (v2)
                let result = await execDocker('docker compose version');
                if (result.success && result.stdout.includes('Docker Compose version')) {
                    return true;
                }
                // Si échec, test l'ancienne syntaxe (v1)
                result = await execDocker('docker-compose --version');
                return result.success && result.stdout.includes('docker-compose version');
            },
            points: 15
        },
        {
            name: 'Conteneur Hello World fonctionnel',
            test: async () => {
                const result = await execDocker('docker run --rm hello-world');
                return result.success && result.stdout.includes('Hello from Docker');
            },
            points: 25
        },
        {
            name: 'Images Docker listées',
            test: async () => {
                const result = await execDocker('docker images');
                return result.success;
            },
            points: 15
        },
        {
            name: 'Conteneurs Docker gérés',
            test: async () => {
                const result = await execDocker('docker ps -a');
                return result.success;
            },
            points: 25
        }
    ];

    await runTests('tp1', tests);
}

// ===== TP2 - IMAGES ET DOCKERFILES =====
async function testTP2() {
    logHeader('TP2 - IMAGES ET DOCKERFILES');

    const tests = [
        {
            name: 'Dockerfile frontend existe',
            test: async () => {
                return fileExists('biblioflow-frontend/Dockerfile');
            },
            points: 20
        },
        {
            name: 'Dockerfile backend existe',
            test: async () => {
                return fileExists('biblioflow-backend/Dockerfile') || fileExists('biblioflow-backend/Dockerfile.dev');
            },
            points: 20
        },
        {
            name: 'Multi-stage build configuré',
            test: async () => {
                if (fileExists('biblioflow-frontend/Dockerfile')) {
                    const content = fs.readFileSync('biblioflow-frontend/Dockerfile', 'utf8');
                    return content.includes('AS dev') && content.includes('AS production');
                }
                return false;
            },
            points: 30
        },
        {
            name: '.dockerignore configuré',
            test: async () => {
                return fileExists('.dockerignore') || fileExists('biblioflow-frontend/.dockerignore');
            },
            points: 15
        },
        {
            name: 'Images construites avec succès',
            test: async () => {
                const result = await execDocker('docker images | grep -E "(biblioflow|courdocker)"');
                return result.success && result.stdout.length > 0;
            },
            points: 15
        }
    ];

    await runTests('tp2', tests);
}

// ===== TP3 - VOLUMES ET RÉSEAUX =====
async function testTP3() {
    logHeader('TP3 - VOLUMES ET RÉSEAUX');

    const tests = [
        {
            name: 'Volumes Docker créés',
            test: async () => {
                const result = await execDocker('docker volume ls | grep -E "(postgres|mongodb)"');
                return result.success && result.stdout.length > 0;
            },
            points: 25
        },
        {
            name: 'Réseaux Docker configurés',
            test: async () => {
                const result = await execDocker('docker network ls | grep biblioflow');
                return result.success && result.stdout.includes('biblioflow');
            },
            points: 25
        },
        {
            name: 'Bind mounts configurés',
            test: async () => {
                // Test pour Docker Compose v2 - cherche les bind mounts normalisés
                const result = await execDocker('docker compose config');
                if (result.success) {
                    const config = result.stdout;
                    // Vérifie la présence de bind mounts pour le développement
                    const hasBindMounts =
                        config.includes('type: bind') &&
                        (config.includes('target: /app/src') || config.includes('target: /usr/src/app/src'));

                    if (hasBindMounts) {
                        return true;
                    }
                }

                // Fallback pour Docker Compose v1
                const fallbackResult = await execDocker('docker-compose config | grep -E "\\./.*:/.*"');
                return fallbackResult.success && fallbackResult.stdout.length > 0;
            },
            points: 25
        },
        {
            name: 'Isolation réseau fonctionnelle',
            test: async () => {
                const frontend = await execDocker('docker network inspect biblioflow_frontend');
                const backend = await execDocker('docker network inspect biblioflow_backend');
                return frontend.success && backend.success;
            },
            points: 25
        }
    ];

    await runTests('tp3', tests);
}

// ===== TP4 - BASES DE DONNÉES =====
async function testTP4() {
    logHeader('TP4 - BASES DE DONNÉES');

    const tests = [
        {
            name: 'PostgreSQL opérationnel',
            test: async () => {
                const result = await execDocker('docker-compose exec postgres pg_isready -U postgres');
                return result.success;
            },
            points: 25
        },
        {
            name: 'MongoDB opérationnel',
            test: async () => {
                const result = await execDocker('docker-compose exec mongodb mongosh --eval "db.adminCommand(\'ping\')"');
                return result.success && result.stdout.includes('ok');
            },
            points: 25
        },
        {
            name: 'Scripts d\'initialisation PostgreSQL',
            test: async () => {
                const initDir = 'docker/postgres/init';
                return fileExists(initDir) && fs.readdirSync(initDir).some(file => file.endsWith('.sql'));
            },
            points: 25
        },
        {
            name: 'Persistance des données validée',
            test: async () => {
                const result = await execDocker('docker-compose exec postgres psql -U postgres -d biblioflow -c "SELECT COUNT(*) FROM books;"');
                return result.success && result.stdout.includes('(1 row)');
            },
            points: 25
        }
    ];

    await runTests('tp4', tests);
}

// ===== TP5 - DOCKER COMPOSE MULTI-SERVICES (NOTÉ) =====
async function testTP5() {
    logHeader('TP5 - DOCKER COMPOSE MULTI-SERVICES (NOTÉ) 🎯');

    const tests = [
        {
            name: '🏗️ Architecture - Nginx Reverse Proxy',
            test: async () => {
                const response = await makeRequest(`${CONFIG.baseUrl}/health`);
                return response.statusCode === 200;
            },
            points: 6
        },
        {
            name: '🏗️ Architecture - Frontend Angular',
            test: async () => {
                const response = await makeRequest(CONFIG.baseUrl);
                return response.statusCode === 200 && response.data.includes('html');
            },
            points: 6
        },
        {
            name: '🏗️ Architecture - Backend NestJS API',
            test: async () => {
                const response = await makeRequest(`${CONFIG.apiUrl}/books`);
                return response.statusCode === 200;
            },
            points: 6
        },
        {
            name: '🏗️ Architecture - PostgreSQL Database',
            test: async () => {
                const result = await execDocker('docker-compose exec postgres pg_isready -U postgres -d biblioflow');
                return result.success;
            },
            points: 6
        },
        {
            name: '🏗️ Architecture - MongoDB Database',
            test: async () => {
                const result = await execDocker('docker-compose exec mongodb mongosh --eval "db.adminCommand(\'ping\')"');
                return result.success && result.stdout.includes('ok');
            },
            points: 6
        },
        {
            name: '🌐 Réseaux - Routing Frontend',
            test: async () => {
                const response = await makeRequest(CONFIG.baseUrl);
                return response.statusCode === 200 && (
                    response.data.includes('<app-') ||
                    response.data.includes('ng-') ||
                    response.data.includes('angular')
                );
            },
            points: 8
        },
        {
            name: '🌐 Réseaux - Routing API',
            test: async () => {
                const response = await makeRequest(`${CONFIG.apiUrl}/books`);
                const isJson = response.data.includes('"message"') || response.data.includes('"data"');
                return response.statusCode === 200 && isJson;
            },
            points: 8
        },
        {
            name: '🌐 Réseaux - Communication Inter-Services',
            test: async () => {
                const pgResult = await execDocker('docker-compose exec backend sh -c "ping -c 1 postgres > /dev/null 2>&1 && echo SUCCESS || echo FAIL"');
                const mongoResult = await execDocker('docker-compose exec backend sh -c "ping -c 1 mongodb > /dev/null 2>&1 && echo SUCCESS || echo FAIL"');
                return pgResult.success && pgResult.stdout.includes('SUCCESS') &&
                    mongoResult.success && mongoResult.stdout.includes('SUCCESS');
            },
            points: 9
        },
        {
            name: '🔐 Sécurité - Variables d\'environnement JWT',
            test: async () => {
                const result = await execDocker('docker-compose exec backend env | grep JWT_SECRET');
                return result.success && !result.stdout.includes('dev-secret-key');
            },
            points: 8
        },
        {
            name: '🔐 Sécurité - Variables PostgreSQL',
            test: async () => {
                const result = await execDocker('docker-compose exec postgres env | grep POSTGRES_PASSWORD');
                return result.success && !result.stdout.includes('postgres123');
            },
            points: 7
        },
        {
            name: '🔐 Sécurité - Utilisateur non-root',
            test: async () => {
                const result = await execDocker('docker-compose exec backend whoami');
                const user = result.stdout.trim();
                return result.success && user !== 'root' && user.length > 0;
            },
            points: 5
        },
        {
            name: '🔐 Sécurité - Réseaux isolés',
            test: async () => {
                const result = await execDocker('docker network ls | grep biblioflow');
                return result.success && result.stdout.includes('biblioflow_frontend') && result.stdout.includes('biblioflow_backend');
            },
            points: 5
        },
        {
            name: '⚙️ Fonctionnalité - CRUD GET',
            test: async () => {
                const response = await makeRequest(`${CONFIG.apiUrl}/books`);
                const isValidJson = response.data.includes('"data"') || response.data.includes('[');
                return response.statusCode === 200 && isValidJson;
            },
            points: 5
        },
        {
            name: '⚙️ Fonctionnalité - CRUD POST',
            test: async () => {
                const testBook = {
                    title: 'Test Validation Globale',
                    author: 'Script de Test'
                };

                const response = await makeRequest(`${CONFIG.apiUrl}/books`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(testBook)
                });

                return response.statusCode === 200 || response.statusCode === 201;
            },
            points: 5
        },
        {
            name: '⚙️ Fonctionnalité - Persistance PostgreSQL',
            test: async () => {
                const result = await execDocker('docker-compose exec postgres psql -U postgres -d biblioflow -c "SELECT COUNT(*) FROM books;"');
                return result.success && result.stdout.includes('(1 row)');
            },
            points: 5
        },
        {
            name: '⚙️ Fonctionnalité - MongoDB Logs',
            test: async () => {
                const result = await execDocker('docker-compose exec mongodb mongosh --eval "use biblioflow_logs; db.getName()"');
                return result.success && result.stdout.includes('biblioflow_logs');
            },
            points: 5
        }
    ];

    await runTests('tp5', tests);

    // Test bonus persistance
    logInfo('\n🔄 Test bonus - Persistance après redémarrage...');
    try {
        await execDocker('docker-compose restart backend');
        await new Promise(resolve => setTimeout(resolve, 10000));

        const response = await makeRequest(`${CONFIG.apiUrl}/books`);
        if (response.statusCode === 200 && response.data.includes('Test Validation Globale')) {
            logBonus('BONUS - Persistance des données validée (+2 points)');
            globalResults.tp5.score += 2;
        }
    } catch (error) {
        logWarning('BONUS - Test persistance échoué');
    }
}

// ===== TP6 - HOT RELOAD DÉVELOPPEMENT =====
async function testTP6() {
    logHeader('TP6 - HOT RELOAD DÉVELOPPEMENT');

    const tests = [
        {
            name: 'Configuration docker-compose.dev.yml',
            test: async () => {
                return fileExists('docker-compose.dev.yml');
            },
            points: 20
        },
        {
            name: 'Bind mounts configurés pour hot reload',
            test: async () => {
                const result = await execDocker('docker inspect biblioflow-frontend | grep -A 5 -B 5 "src:/app/src"');
                return result.stdout.includes('/src:/app/src') || result.stdout.includes('src:/app/src');
            },
            points: 25
        },
        {
            name: 'CHOKIDAR_USEPOLLING activé',
            test: async () => {
                const result = await execDocker('docker-compose exec frontend env | grep CHOKIDAR');
                return result.success && result.stdout.includes('CHOKIDAR_USEPOLLING=1');
            },
            points: 20
        },
        {
            name: 'Ports de debug exposés',
            test: async () => {
                const result = await execDocker('docker-compose ps | grep -E "9229|9230"');
                return result.success && (result.stdout.includes('9229') || result.stdout.includes('9230'));
            },
            points: 15
        },
        {
            name: 'Angular CLI disponible',
            test: async () => {
                const result = await execDocker('docker-compose exec frontend npx ng version --help');
                return result.success && result.stdout.includes('Angular CLI');
            },
            points: 10
        },
        {
            name: 'NestJS CLI disponible',
            test: async () => {
                const result = await execDocker('docker-compose exec backend npx nest --version');
                return result.success && result.stdout.trim().length > 0;
            },
            points: 10
        }
    ];

    await runTests('tp6', tests);
}

// Fonction pour exécuter une série de tests
async function runTests(tpKey, tests) {
    for (const test of tests) {
        try {
            const passed = await test.test();
            if (passed) {
                logSuccess(`${test.name} - OK`);
                globalResults[tpKey].score += test.points;
                globalResults[tpKey].tests.push({ name: test.name, status: 'PASS', points: test.points });
            } else {
                logError(`${test.name} - ÉCHEC`);
                globalResults[tpKey].tests.push({ name: test.name, status: 'FAIL', points: 0 });
            }
        } catch (error) {
            logError(`${test.name} - ERREUR: ${error.message}`);
            globalResults[tpKey].tests.push({ name: test.name, status: 'ERROR', points: 0 });
        }
    }
}

// ===== VALIDATION FICHIERS DE CONFIGURATION =====
async function validateConfigFiles() {
    logHeader('VALIDATION FICHIERS DE CONFIGURATION');

    const requiredFiles = [
        { path: 'docker-compose.yml', name: 'Docker Compose principal' },
        { path: '.env', name: 'Variables d\'environnement' },
        { path: 'Makefile', name: 'Scripts d\'automatisation' },
        { path: 'README.md', name: 'Documentation' },
        { path: 'docker/nginx/nginx.conf', name: 'Configuration Nginx' },
        { path: 'docker/postgres/init', name: 'Scripts init PostgreSQL', isDir: true },
        { path: 'biblioflow-frontend/Dockerfile', name: 'Dockerfile Frontend' },
        { path: 'biblioflow-backend/Dockerfile.dev', name: 'Dockerfile Backend Dev' }
    ];

    let configScore = 0;
    for (const file of requiredFiles) {
        if (fileExists(file.path)) {
            logSuccess(`${file.name} - Présent`);
            configScore += 10;
        } else {
            logWarning(`${file.name} - Manquant`);
        }
    }

    logInfo(`Score configuration: ${configScore}/${requiredFiles.length * 10}`);
    return configScore;
}

// ===== AFFICHAGE DES RÉSULTATS FINAUX =====
function displayFinalResults(configScore) {
    logHeader('🏆 RÉSULTATS FINAUX FORMATION DOCKER');

    const totalScore = Object.values(globalResults).reduce((sum, tp) => sum + tp.score, 0);
    const maxScore = Object.values(globalResults).reduce((sum, tp) => sum + tp.total, 0);
    const finalScore = totalScore + configScore;
    const finalMaxScore = maxScore + 80; // 80 points pour la config

    log('\n📊 SCORES PAR TP:', 'bright');
    Object.entries(globalResults).forEach(([key, tp]) => {
        const percentage = Math.round((tp.score / tp.total) * 100);
        const color = percentage >= 90 ? 'green' : percentage >= 80 ? 'yellow' : 'red';
        log(`${key.toUpperCase()}: ${tp.score}/${tp.total} points (${percentage}%) - ${tp.name}`, color);
    });

    log(`\nCONFIGURATION: ${configScore}/80 points`, 'blue');

    const finalPercentage = Math.round((finalScore / finalMaxScore) * 100);
    log(`\n🎯 SCORE GLOBAL: ${finalScore}/${finalMaxScore} points (${finalPercentage}%)`, 'bright');

    // Badge final
    if (finalPercentage >= 95) {
        log('\n🥇 EXPERT DOCKER - Maîtrise exceptionnelle!', 'green');
        log('🌟 Vous maîtrisez parfaitement Docker et Docker Compose!', 'green');
    } else if (finalPercentage >= 90) {
        log('\n🥈 AVANCÉ DOCKER - Excellente maîtrise!', 'green');
        log('🎉 Vous avez une très bonne compréhension de Docker!', 'green');
    } else if (finalPercentage >= 80) {
        log('\n🥉 INTERMÉDIAIRE DOCKER - Bonne maîtrise!', 'yellow');
        log('👍 Vous maîtrisez bien les concepts Docker!', 'yellow');
    } else if (finalPercentage >= 70) {
        log('\n📚 DÉBUTANT AVANCÉ - Bases solides!', 'yellow');
        log('⚠️  Continuez à pratiquer pour améliorer vos compétences!', 'yellow');
    } else {
        log('\n📖 DÉBUTANT - Bases à consolider', 'red');
        log('🔄 Reprenez les TP pour renforcer vos connaissances!', 'red');
    }

    // Compétences acquises
    log('\n🎓 COMPÉTENCES DOCKER ACQUISES:', 'cyan');
    const skills = [
        '✅ Conteneurisation d\'applications',
        '✅ Création et optimisation d\'images Docker',
        '✅ Gestion des volumes et réseaux',
        '✅ Orchestration multi-services avec Docker Compose',
        '✅ Configuration d\'environnements dev/prod',
        '✅ Sécurisation des conteneurs',
        '✅ Persistance des données',
        '✅ Hot reload et debugging',
        '✅ Monitoring et logs centralisés',
        '✅ Automatisation avec scripts'
    ];

    skills.forEach(skill => log(skill, 'cyan'));

    // Informations d'accès
    log('\n🌐 ACCÈS À VOTRE APPLICATION:', 'blue');
    log(`   • Application complète: ${CONFIG.baseUrl}`);
    log(`   • API Backend: ${CONFIG.apiUrl}/books`);
    log(`   • Frontend direct: ${CONFIG.frontendUrl}`);

    log(`\n📅 Formation validée le: ${new Date().toLocaleString('fr-FR')}`, 'dim');
    log('🎉 Félicitations pour avoir terminé la formation Docker!', 'bright');
}

// ===== FONCTION PRINCIPALE =====
async function runGlobalValidation() {
    log('\n🚀 VALIDATION GLOBALE FORMATION DOCKER', 'bright');
    log('=' .repeat(80), 'bright');
    log('📚 Test de tous les TP (TP1 à TP6)', 'blue');

    logInfo('Vérification de l\'environnement Docker...');
    const dockerCheck = await execDocker('docker-compose ps');
    if (!dockerCheck.success) {
        logError('Docker Compose non accessible. Assurez-vous que les services sont démarrés.');
        log('💡 Lancez: make dev ou docker-compose up -d', 'yellow');
        return;
    }

    logInfo('Attente de stabilisation des services (10 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
        // Tests par TP
        await testTP1();
        await testTP2();
        await testTP3();
        await testTP4();
        await testTP5();
        await testTP6();

        // Validation configuration
        const configScore = await validateConfigFiles();

        // Résultats finaux
        displayFinalResults(configScore);

    } catch (error) {
        logError(`Erreur générale lors de la validation: ${error.message}`);
    }
}

// Lancement du script
if (require.main === module) {
    runGlobalValidation().catch(error => {
        logError(`Erreur fatale: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { runGlobalValidation, globalResults };