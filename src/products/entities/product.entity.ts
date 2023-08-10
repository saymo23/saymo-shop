import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity()
export class Product {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0
  })
  stock: number;

  @Column('text', {
    array: true
  })
  sizes: string[];

  @Column("text", {
    array: true,
    default: []
  })
  tags?: string[]

  @Column('text')
  gender: string;

  @Column('int', {
    default: 1
  })
  status: number;

  @OneToMany(
    () => ProductImage, //Retorno
    (productImage) => productImage.product,
    {
      cascade: true,
      eager: true //Este se usa cuando no buscamos con querybuilder
    }
  )
  images?: ProductImage[];

  //El beforeinsert es un proceso que puedes realizar antes de
  //que la información se mande a insertar.
  @BeforeInsert()
  checkSlugInsert(){
    if( !this.slug ){
      this.slug = this.title;
    }

    this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", "");
  }

  @BeforeUpdate()
  checkSlugUpdate(){
    if( !this.slug ){
      this.slug = this.title;
    }

    this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", "");
  }

}
