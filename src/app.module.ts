import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

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

    CommonModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}  
