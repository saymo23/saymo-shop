import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { NotFoundError } from 'rxjs';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid'

@Injectable()
export class ProductsService {

  //Para los errores de consola
  private readonly logger = new Logger('ProductsService')
  
  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>

  ){}
  
  async create(createProductDto: CreateProductDto) {
    
    try {

      const product = this.productRepository.create(
        createProductDto
      )

      await this.productRepository.save( product );

      return product

    } catch (error) {
        this.handleDBExceptions(error);
    }

  }

  findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const product = this.productRepository.find({
          take: limit,
          skip: offset
        }
        //TODO: Relaciones
      );


      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(term: string) {
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({
        id: term
      });
    } else {
      // product = await this.productRepository.findOneBy({
      //   slug: term
      // });
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`, {
        title: term.toUpperCase(), 
        slug: term.toLowerCase()
      }).getOne();
    }

    if (!product) 
      throw new NotFoundException(`Product Not Found: ${term}`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    //El preload sirve para garantizar primero la busqueda del producto, antes de salvarlo
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto
    })

    if(!product)
      throw new NotFoundException(`Product with id: ${id} not found `)

    try {
      await this.productRepository.save( product );
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
    return 
  }

  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove(product);
  }


  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    //this.logger.error(error);
    
    throw new InternalServerErrorException('Help!')
  }

}
