import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'src/modules/files/multer.config';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    })
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule { }
