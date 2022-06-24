import bodyParser from 'body-parser';
import express from 'express';
import { map } from 'rxjs';
import { Telegraf } from 'telegraf';
import { firebaseAuth, firebaseConfig, serverPort, telegramBotToken } from './config';
import { Database } from './database';
import { Chat } from './interfaces';

const db = new Database(firebaseConfig, firebaseAuth);

/***************** TELEGRAM BOT *****************/

const bot = new Telegraf(telegramBotToken);

bot.on('message', (ctx, next) => {
    const { first_name, last_name, username } = ctx.update.message.from;
    console.log(`NEW MESSAGE from ${username} | ${first_name} ${last_name}`);
    db.saveMessage(ctx.update.message).subscribe();
    next();
});

bot.launch();


/***************** HTTP SERVER *****************/

const server = express();

server.use(bodyParser.text());
server.use(bodyParser.json());

server.get('/chats', (req, res) => {
    db.getAllMessages().pipe(
        map((messages) => {
            const chats: Chat[] = [];
            
            messages.forEach(msg => {
                const chat = chats.find(chat => chat.chatId === msg.chat.id);

                if (chat) {
                    if (chat.lastMessage.date < msg.date) {
                        chat.lastMessage = msg;
                    }
                } else {
                    chats.push({
                        chatId: msg.chat.id,
                        lastMessage: msg
                    });
                }
            });

            chats.sort((a, b) => b.lastMessage.date - a.lastMessage.date);

            return chats;
        })
    ).subscribe({
        next: (chats) => {
            res.status(200).json(chats);
        },
        error: (err) => {
            res.status(500).send(err);
        }
    });
});

server.get('/chats/:chatId/messages', (req, res) => {
    const chatId = Number(req.params.chatId) || 0;

    db.getAllMessages().pipe(
        map((messages) => {
            const chatMessages = messages.filter(msg => msg.chat.id === chatId);
            chatMessages.sort((a, b) => b.date = a.date);
            return chatMessages;
        })
    ).subscribe({
        next: (messages) => {
            res.status(200).json(messages);
        },
        error: (err) => {
            res.status(500).send(err);
        }
    });
});

server.post('/message/:chatId', (req, res) => {
    const chatId = Number(req.params.chatId) || 0;
    const message: string = req.body;

    bot.telegram.sendMessage(chatId, message).then(() => {
        res.sendStatus(204);
    }).catch((err) => {
        console.error('Error sending message!', err);
        res.status(500).send(err);
    });    
});

console.log('Server listening at the port', serverPort);
server.listen(serverPort);



// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))