import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegrambot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import LocalSession from 'telegraf-session-local';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: '6039046676:AAEdgBhmJzJPZCeUKJb4LgllC59EMx592qU',
    }),
  ],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}
