import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';


import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetHeader } from './decorators/get-headers.decorators';


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

}
