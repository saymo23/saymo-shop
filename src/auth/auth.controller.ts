import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';


import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';

import { GetUser,GetHeader, RoleProtected, Auth } from './decorators/';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) { 
    return this.authService.create(createUserDto); 
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) { 
    return this.authService.login(loginUserDto); 
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  test(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @GetHeader() header: string
  ){
    // console.log({ user: request.user });
    return {
      ok: true,
      user,
      userEmail,
      message: 'Oli, uwu',
      header
    }
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-admin', 'user'])
  @RoleProtected(ValidRoles.superUser, ValidRoles.user) //Autorizacion
  @UseGuards(AuthGuard(), UserRoleGuard) //Authentic
  privateRoute2(
    @GetUser() user: User
  ){

    return {
      ok: true,
      user
    }

  }

  @Get('private3')
  @Auth(ValidRoles.user) //Decorador Anidado
  private3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }


}
