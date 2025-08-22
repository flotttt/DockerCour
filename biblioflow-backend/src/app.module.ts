// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { Book } from './books/entities/book.entity';

// 🔍 DEBUG - Affichez les variables pour vérifier
console.log('🔍 Variables PostgreSQL reçues :');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost', // ✅ UTILISEZ les variables d'env
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: process.env.POSTGRES_DB || 'biblioflow',
      entities: [Book],
      synchronize: process.env.NODE_ENV === 'development',
      logging: true,
    }),
    AuthModule,
    UsersModule,
    BooksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}