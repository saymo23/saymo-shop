import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";


export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    //El contexto indica en cual es la situación en la que se encuentra la aplicacion
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if(!user)
      throw new InternalServerErrorException('User not found');
    
    return user
  }
)