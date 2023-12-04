import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  //El fileInterceptor es para capturar el archivo y procesarlo y/o filtrar los archivos antes de subirlos
  @Post('product')
  @UseInterceptors( 
    FileInterceptor('file', {
      fileFilter: fileFilter
    })
  )
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File,
  ){
    if (!file) {
      return { message: 'No file provided' };
    }
    console.log('file', file);
    
    return file
  }
   
}

