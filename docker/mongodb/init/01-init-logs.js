print('🚀 Initialisation de la base MongoDB BiblioFlow');

db = db.getSiblingDB('biblioflow_logs');

db.createUser({
    user: 'biblioflow_app',
    pwd: 'biblioflow_logs_password',
    roles: [
        {
            role: 'readWrite',
            db: 'biblioflow_logs'
        }
    ]
});

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

db.createCollection('user_activities', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['timestamp', 'userId', 'action', 'resource'],
            properties: {
                timestamp: {
                    bsonType: 'date'
                },
                userId: {
                    bsonType: 'string'
                },
                action: {
                    bsonType: 'string',
                    enum: ['login', 'logout', 'borrow_book', 'return_book', 'search', 'view_profile', 'update_profile']
                },
                resource: {
                    bsonType: 'string'
                },
                ipAddress: {
                    bsonType: 'string'
                },
                userAgent: {
                    bsonType: 'string'
                },
                details: {
                    bsonType: 'object'
                }
            }
        }
    }
});

db.api_logs.createIndex({ timestamp: -1 });
db.api_logs.createIndex({ level: 1, timestamp: -1 });
db.api_logs.createIndex({ service: 1, timestamp: -1 });

db.user_activities.createIndex({ timestamp: -1 });
db.user_activities.createIndex({ userId: 1, timestamp: -1 });
db.user_activities.createIndex({ action: 1, timestamp: -1 });

print('📝 Insertion de logs de test...');

db.api_logs.insertMany([
    {
        timestamp: new Date(),
        level: 'info',
        message: 'Application started successfully',
        service: 'biblioflow-backend',
        metadata: {
            version: '1.0.0',
            environment: 'development'
        }
    },
    {
        timestamp: new Date(),
        level: 'info',
        message: 'Database connection established',
        service: 'biblioflow-backend',
        metadata: {
            database: 'postgres',
            connectionPool: 10
        }
    },
    {
        timestamp: new Date(),
        level: 'warn',
        message: 'High memory usage detected',
        service: 'biblioflow-backend',
        metadata: {
            memoryUsage: '85%',
            threshold: '80%'
        }
    }
]);

db.user_activities.insertMany([
    {
        timestamp: new Date(),
        userId: 'john.doe',
        action: 'login',
        resource: '/auth/login',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: {
            loginMethod: 'email',
            successful: true
        }
    },
    {
        timestamp: new Date(),
        userId: 'john.doe',
        action: 'search',
        resource: '/books/search',
        ipAddress: '192.168.1.100',
        details: {
            query: 'clean code',
            resultsCount: 2
        }
    }
]);

print('✅ Initialisation MongoDB terminée avec succès!');
print('📊 Collections créées:');
print('  - api_logs: ' + db.api_logs.countDocuments() + ' documents');
print('  - user_activities: ' + db.user_activities.countDocuments() + ' documents');