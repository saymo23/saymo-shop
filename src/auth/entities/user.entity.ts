import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('users')
export class User {


  @Column('text')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true
  })
  email: string;

  @Column('text', {
    select: false
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', {
    default: true
  })
  isActive: boolean;
  
  @Column('text', {
    array: true,
    default: ['user']
  })
  roles: String[];

  @BeforeInsert()
  checkFieldsBeforeInsert(){
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate(){
    this.checkFieldsBeforeInsert();
  }
}
