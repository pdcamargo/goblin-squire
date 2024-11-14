import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // TypeOrmModule.forRoot(databaseConfig())
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080',
      realm: 'master',
      clientId: 'goblinsquire',
      secret: 'k5jUDHxK8hYsLas5WhosoRuoU5NynAmG',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {} // private dataSource: DataSource
}
