import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { NotFoundError } from 'rxjs';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

  //Para los errores de consola
  private readonly logger = new Logger('ProductsService')
  
  //? El DataSource es para los query runner, clase 145
  //@                                                      
  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource


  ){}
  
  //@                                                      
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

  //@                                                      
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

  //@                                                      
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

  //@                                                      
  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map(image => image.url )
    }
  }

  
  /**
   * update
   * @param id: string Identificador del objeto
   * @param updateProductDto: El objeto actualizado y modeado por el DT
  **/
  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    //El preload sirve para garantizar primero la busqueda del producto, antes de salvarlo
    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    })

    if(!product)
      throw new NotFoundException(`Product with id: ${id} not found `)

    //Controlaremos si viene imagenes (datos relacionales) para comprobar si hay errores en el proceso
    //Ejemplo: que la imagen no se cargue correctamente o que no haya espacio en el servidor o permisos de escritura, erc.
    // Esto se hace con el Query Runner, el cual hacer Rollbacks

    const queryRunner = this.dataSource.createQueryRunner();

    //Conectamos
    await queryRunner.connect();
    //iniciamos los cambios en la base de datos SIN CONFIRMAR
    await queryRunner.startTransaction();

    try {

      if( images ){
        //CUIDADO: POSIBLE MEME
        await queryRunner.manager.delete( ProductImage, 
                { product: { id } }
              );
        product.images = images.map( 
          image => this.productImageRepository.create({ url: image }))
      } else {
        // 
      }

      await queryRunner.manager.save( product );
      //await this.productRepository.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      //return product;//Enviamos producto completo
      return this.findOnePlain(id)//Realizamos una consulta nueva pero ahora con el producto de las imagenes plano


    } catch (error) {

      await queryRunner.rollbackTransaction();

      this.handleDBExceptions(error);
    }

  }

  //@                                                      
  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove(product);



  }


  //@                                                      
  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    //this.logger.error(error);
    
    throw new InternalServerErrorException('Help!')
  }


  async deleteAllProducst(){
    const query = this.productImageRepository.createQueryBuilder('product');

    try{
      return await query.delete().where({}).execute();
    }catch(error){
      this.handleDBExceptions(error);
    }

  }

}
