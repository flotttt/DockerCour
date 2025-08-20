// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { Book } from './books/entities/book.entity';

@Module({
  imports: [
    // ✅ AJOUT : Configuration TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'biblioflow_postgres_secure_password_2024',
      database: 'biblioflow',
      entities: [Book], // ✅ Importez vos entités ici
      synchronize: true, // ✅ Auto-création des tables
      logging: true, // ✅ Pour voir les requêtes SQL
    }),
    AuthModule,
    UsersModule,
    BooksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}