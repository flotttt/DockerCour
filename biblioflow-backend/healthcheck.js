// ===== SCRIPT DE HEALTH CHECK POUR BACKEND NESTJS =====

const http = require('http');

const options = {
    host: 'localhost',
    port: process.env.PORT || 3000,
    path: '/books',
    method: 'GET',
    timeout: 5000,
};

const healthCheck = http.request(options, (res) => {
    console.log(`Health check status: ${res.statusCode}`);

    if (res.statusCode === 200) {
        console.log('✅ Health check passed');
        process.exit(0);
    } else {
        console.log(`❌ Health check failed with status: ${res.statusCode}`);
        process.exit(1);
    }
});

healthCheck.on('error', (err) => {
    console.log('❌ Health check error:', err.message);
    process.exit(1);
});

healthCheck.on('timeout', () => {
    console.log('❌ Health check timeout');
    healthCheck.destroy();
    process.exit(1);
});

healthCheck.setTimeout(5000);
healthCheck.end();