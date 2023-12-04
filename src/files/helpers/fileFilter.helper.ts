
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
console.log('filee', file);

    if( !file ) 
        return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1]
    
    console.log(fileExtension);
    
    callback(null, true)

}