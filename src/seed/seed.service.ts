import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository( User )
     private readonly userRepository: Repository<User>
  ){}

  async runSeed() {

    //? eliminamos todas las tablas
    await this.deleteTables();

    //$ Antes de insertar requerimos los usuarios para los productos

    const userDefault = await this.insertUsers();

    // await this.insertNewProducts(userDefault);

    return 'SEED EXECUTED';

  }

  private async deleteTables(){
    //? Eliminamos todos los productos
    await this.productService.deleteAllProducts();

    const queryBuilder = await this.userRepository.createQueryBuilder();

    await queryBuilder
    .delete()
    .where({})
    .execute();
  }

  private async insertUsers() {
    //$ obtenemos los datos iniciales
    const seedUsers = initialData.users;

    const users: User[] = [];
    
    console.log(seedUsers);

    //$ Preparamos los primemos users
    seedUsers.forEach(user => {
      
        user.password = bcrypt.hashSync(user.password, 10)
        
        users.push( this.userRepository.create( user ) )
    });

    //$ Insertamos todos los usuarios al mismo tiempo
    const dbUsers = await this.userRepository.save( seedUsers );

    //$ este usuario sera el que tendra por defecto todas las relaciones que necesitan los objetos para crear sus registros
    //$ Ya que requieren el user_id
    return dbUsers[0];

  }

  private async insertNewProducts(userDefault: User){
    // await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product => {
      insertPromises.push(this.productService.create(product, userDefault))
    })

    await Promise.all( insertPromises )

    return true
  }

}
