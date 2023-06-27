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
        },
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
      product = await this.productRepository.findOneBy({
        slug: term
      });
    }

    if (!product) 
      throw new NotFoundException(`Product Not Found: ${term}`);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
