import {
  Action,
  Ctx,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { actionButtons } from './telegrambot.buttons';
import { Context } from './telegrambot.context';
import axios from 'axios';

import { consultDanfe } from 'src/service/consultDanfe';
import { getPdf } from 'src/service/getPdf';
import { verifyAccessKeyRegex } from 'src/utils/verifyAccessKeyRegex';

@Update()
export class TelegramBotService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(
      'Olá, eu sou o bot gerador de DANFE. Digite a chave de acesso da sua NF para gerar o DANFE.',
    );
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    ctx.reply('Aguarde um momento, estou gerando o DANFE...');

    try {
      const danfeAccessKey = message;

      const danfeAccessKeyIsValid = verifyAccessKeyRegex(danfeAccessKey);

      if (!danfeAccessKeyIsValid) throw new Error('Chave de acesso inválida.');

      const teste = await consultDanfe(danfeAccessKey);

      const danfeToPDF = await getPdf(danfeAccessKey);

      const binaryData = Buffer.from(danfeToPDF.data, 'base64');

      const fileName = `${danfeAccessKey}.pdf`;

      ctx.replyWithDocument({ source: binaryData, filename: fileName });
    } catch (error) {
      ctx.reply(error.message);
    }
  }
}
