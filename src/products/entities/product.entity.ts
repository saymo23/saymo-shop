import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @Column('text')
  gender: string;

  @Column('int', {
    default: 1
  })
  status: number

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

}
