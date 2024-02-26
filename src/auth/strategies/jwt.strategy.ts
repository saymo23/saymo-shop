import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService
  ) {
    super({
      secretOrKey: configService.get('JWT_TOKEN'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    })
  }

  async validate( payload: JwtPayload ):Promise<User> { 

    // const { email } = payload; //revisar el usaurio en la base de datos

    // const user = await this.userRepository.findOneBy({ email });

    const { id } = payload; //revisar el usaurio en la base de datos

    const user = await this.userRepository.findOneBy({ id });

    // console.log(user);
    

    if(!user){ throw new UnauthorizedException('Token not valid') }

    // if(!user.isActive){ throw new UnauthorizedException('User is not active') }
    

    if(!user.isActive){ throw new UnauthorizedException('Unauthorized') }

    
    return user;
  }

}