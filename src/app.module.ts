import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './controller/app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
