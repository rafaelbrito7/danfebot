import { registerAs } from '@nestjs/config';

export const telegram = registerAs('telegram', () => ({
  token: process.env.TELEGRAM_BOT_TOKEN,
}));
