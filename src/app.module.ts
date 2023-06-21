import { Module } from '@nestjs/common';
import { TelegramBotModule } from './telegramBot/telegrambot.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TelegramBotModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
