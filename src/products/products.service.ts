import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { NotFoundError } from 'rxjs';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

  //Para los errores de consola
  private readonly logger = new Logger('ProductsService')
  
  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>


  ){}
  
  async create(createProductDto: CreateProductDto) {

    
    try {
      const { images = [], ...productoDetails } = createProductDto

      const product = this.productRepository.create(
        {
          ...productoDetails,
          images: images.map(
            image => this.productImageRepository.create(      
              { url: image }
            )
        ) 
      }
      )

      await this.productRepository.save( product );

      return  { ...product, images }

    } catch (error) {
        this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const products = await this.productRepository.find({
          take: limit,
          skip: offset,
          relations:{
            images: true
          }
        },
      );


      return products.map( product => ({
        ...product,
        images: product.images.map(img => img.url)
      }))
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
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
                      .where(
                        `UPPER(title) =:title or slug =:slug`, 
                        {
                          title: term.toUpperCase(), 
                          slug: term.toLowerCase()
                        })
                      .leftJoinAndSelect('prod.images', 'prodImages')
                      .getOne();
    }

    if (!product) 
      throw new NotFoundException(`Product Not Found: ${term}`);

    return product;
  }

  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map(image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    //El preload sirve para garantizar primero la busqueda del producto, antes de salvarlo
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
      images: []
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
