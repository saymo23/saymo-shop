import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}

  //? este medoto es importante, requiere sacar boolean | Promise<boolean> | Observable<boolean> 
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    
    //?  Obtenemos los roles del contexto
     
    const validRoles: String[] = this.reflector.get('roles', context.getHandler() );

    //$ si no existen los roles, puede pasar
    if ( !validRoles || validRoles.length === 0 ) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if(!user)
      throw new BadRequestException('User not found');

    for (const role of user.roles) {
      if( validRoles.includes( role ) ){
        return true; 
      }
    }
    

    throw new ForbiddenException(
      `User no have permissions`
    );
  }
}
