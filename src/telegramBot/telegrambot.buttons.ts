import { Markup } from 'telegraf';

export function actionButtons() {
  return Markup.inlineKeyboard([
    {
      text: 'Gerar DANFE',
      callback_data: 'danfe',
    },
  ]);
}
