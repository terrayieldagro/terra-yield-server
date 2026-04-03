import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CropsModule } from './modules/crops/crops.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [AuthModule, PrismaModule, CropsModule, ContactModule],
})
export class AppModule {}
