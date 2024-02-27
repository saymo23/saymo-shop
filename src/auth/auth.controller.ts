import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';


import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetHeader } from './decorators/get-headers.decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';


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
  @UseGuards(AuthGuard(), UserRoleGuard) //Authenticacion
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }


}
