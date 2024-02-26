import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";


export const GetHeader = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    //El contexto indica en cual es la situación en la que se encuentra la aplicacion
    const req = ctx.switchToHttp().getRequest();
    const headers = req.rawHeaders;

    if(!headers)
      throw new InternalServerErrorException('Headers not found');
    
    return headers
  }
)