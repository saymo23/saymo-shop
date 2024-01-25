import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    ConfigModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASS,
      autoLoadEntities: true, //Automaticamente carga las entidades del TypeOrm
      synchronize: true //Sincroniza la base de datos en todos los entornos conectados, algo asi como websockets
    }),

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}  
