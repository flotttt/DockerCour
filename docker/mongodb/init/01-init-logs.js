// ===== INITIALISATION MONGODB POUR BIBLIOFLOW =====
print('🚀 Initialisation de MongoDB BiblioFlow...');

// Connexion à la base de données des logs
db = db.getSiblingDB('biblioflow_logs');

// Création de l'utilisateur applicatif
db.createUser({
    user: 'biblioflow_app',
    pwd: 'biblioflow_mongodb_secure_password_2024',
    roles: [
        {
            role: 'readWrite',
            db: 'biblioflow_logs'
        }
    ]
});

// ===== COLLECTION DES LOGS API =====
db.createCollection('api_logs', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['timestamp', 'level', 'message', 'service'],
            properties: {
                timestamp: {
                    bsonType: 'date',
                    description: 'Timestamp du log (requis)'
                },
                level: {
                    bsonType: 'string',
                    enum: ['error', 'warn', 'info', 'debug'],
                    description: 'Niveau du log (requis)'
                },
                message: {
                    bsonType: 'string',
                    description: 'Message du log (requis)'
                },
                service: {
                    bsonType: 'string',
                    description: 'Service source du log (requis)'
                },
                userId: {
                    bsonType: 'string',
                    description: 'ID utilisateur (optionnel)'
                },
                endpoint: {
                    bsonType: 'string',
                    description: 'Endpoint API appelé'
                },
                method: {
                    bsonType: 'string',
                    description: 'Méthode HTTP'
                },
                statusCode: {
                    bsonType: 'int',
                    description: 'Code de statut HTTP'
                },
                responseTime: {
                    bsonType: 'int',
                    description: 'Temps de réponse en ms'
                },
                metadata: {
                    bsonType: 'object',
                    description: 'Métadonnées additionnelles'
                },
                requestId: {
                    bsonType: 'string',
                    description: 'ID de la requête pour traçabilité'
                }
            }
        }
    }
});

// ===== COLLECTION DES ACTIVITÉS UTILISATEUR =====
db.createCollection('user_activities', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['timestamp', 'userId', 'action', 'resource'],
            properties: {
                timestamp: { bsonType: 'date' },
                userId: { bsonType: 'string' },
                username: { bsonType: 'string' },
                action: {
                    bsonType: 'string',
                    enum: ['login', 'logout', 'register', 'borrow_book', 'return_book', 'search', 'view_profile', 'update_profile', 'admin_action']
                },
                resource: { bsonType: 'string' },
                resourceId: { bsonType: 'string' },
                ipAddress: { bsonType: 'string' },
                userAgent: { bsonType: 'string' },
                success: { bsonType: 'bool' },
                details: { bsonType: 'object' }
            }
        }
    }
});

// ===== COLLECTION DES ERREURS =====
db.createCollection('error_logs', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['timestamp', 'level', 'message', 'service'],
            properties: {
                timestamp: { bsonType: 'date' },
                level: { bsonType: 'string' },
                message: { bsonType: 'string' },
                service: { bsonType: 'string' },
                stack: { bsonType: 'string' },
                userId: { bsonType: 'string' },
                endpoint: { bsonType: 'string' },
                requestBody: { bsonType: 'object' },
                errorCode: { bsonType: 'string' }
            }
        }
    }
});

// ===== INDEX POUR LES PERFORMANCES =====
// Index pour api_logs
db.api_logs.createIndex({ timestamp: -1 });
db.api_logs.createIndex({ level: 1, timestamp: -1 });
db.api_logs.createIndex({ service: 1, timestamp: -1 });
db.api_logs.createIndex({ userId: 1, timestamp: -1 });
db.api_logs.createIndex({ endpoint: 1, timestamp: -1 });

// Index pour user_activities
db.user_activities.createIndex({ timestamp: -1 });
db.user_activities.createIndex({ userId: 1, timestamp: -1 });
db.user_activities.createIndex({ action: 1, timestamp: -1 });
db.user_activities.createIndex({ resource: 1, timestamp: -1 });

// Index pour error_logs
db.error_logs.createIndex({ timestamp: -1 });
db.error_logs.createIndex({ level: 1, timestamp: -1 });
db.error_logs.createIndex({ service: 1, timestamp: -1 });

// ===== DONNÉES DE TEST =====
print('📝 Insertion de logs de test...');

db.api_logs.insertMany([
    {
        timestamp: new Date(),
        level: 'info',
        message: 'BiblioFlow application started successfully',
        service: 'biblioflow-backend',
        endpoint: '/health',
        method: 'GET',
        statusCode: 200,
        responseTime: 15,
        metadata: {
            version: '1.0.0',
            environment: 'development',
            nodeVersion: process.version
        }
    },
    {
        timestamp: new Date(),
        level: 'info',
        message: 'Database connection established',
        service: 'biblioflow-backend',
        metadata: {
            database: 'postgresql',
            host: 'postgres',
            connectionPool: 10
        }
    },
    {
        timestamp: new Date(),
        level: 'info',
        message: 'MongoDB logging system initialized',
        service: 'biblioflow-backend',
        metadata: {
            database: 'mongodb',
            host: 'mongodb',
            collections: ['api_logs', 'user_activities', 'error_logs']
        }
    }
]);

db.user_activities.insertMany([
    {
        timestamp: new Date(),
        userId: 'admin',
        username: 'admin',
        action: 'login',
        resource: '/auth/login',
        ipAddress: '192.168.1.100',
        userAgent: 'BiblioFlow-Frontend/1.0.0',
        success: true,
        details: {
            loginMethod: 'email',
            role: 'admin'
        }
    },
    {
        timestamp: new Date(),
        userId: 'student',
        username: 'student',
        action: 'search',
        resource: '/books/search',
        resourceId: 'clean code',
        ipAddress: '192.168.1.101',
        success: true,
        details: {
            query: 'clean code',
            resultsCount: 2,
            category: 'programming'
        }
    }
]);

// ===== FINALISATION =====
print('✅ Initialisation MongoDB terminée avec succès!');
print('📊 Collections créées:');
print('  - api_logs: ' + db.api_logs.countDocuments() + ' documents');
print('  - user_activities: ' + db.user_activities.countDocuments() + ' documents');
print('  - error_logs: ' + db.error_logs.countDocuments() + ' documents');
print('👤 Utilisateur applicatif créé: biblioflow_app');
print('🔗 Base de données: biblioflow_logs');
print('🚀 MongoDB prêt pour BiblioFlow!');