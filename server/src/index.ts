import { firebaseAuth, firebaseConfig, telegramBotToken } from './config';
import { Telegraf } from 'telegraf';
import { Database } from './database';

const bot = new Telegraf(telegramBotToken);
const db = new Database(firebaseConfig, firebaseAuth);


// db.getAllMessages().subscribe((msg) => {
//     console.log('Messages', msg);
// })

bot.on('message', (ctx, next) => {
    const { first_name, last_name, username } = ctx.update.message.from;
    console.log(`NEW MESSAGE from ${username} | ${first_name} ${last_name}`);
    db.saveMessage(ctx.update.message).subscribe();
    next();
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))