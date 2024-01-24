import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user); 

      delete user.password;

      return user;
      // Regresar el jwt
      
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto){

    // try{
      
      const { password, email } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true}
      });

      if( !user ){         
        console.log('Credentials are not valid (email)', email);
        throw new UnauthorizedException('Credentials are not valid');
        
      }
      
      if( bcrypt.compareSync(password, user.password) ){
        console.log('Credentials are not valid (password)', email);
        throw new UnauthorizedException('Credentials are not valid')
      }

      delete user.password;
      return user;

    // }catch (error){
    //   this.handleDBErrors(error);
    // }

  }

  private handleDBErrors(error: any) {
    if(error.code == '23505'){
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    

  }
 
}
