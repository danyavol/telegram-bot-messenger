import { admindOnlySocket, adminOnly, createAdminToken } from '@services/auth';
import { Crypto } from '@services/crypto';
import express from 'express';
import { bot, serverPort, SUPERADMIN_PASS } from './config';
import { db } from './database';
import routes from './routes';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { Message } from 'telegraf/typings/core/types/typegram';


/***************** HTTP SERVER *****************/

const server = express();
const httpServer = http.createServer(server);

server.use( cors({ origin: ['http://localhost:4200'], credentials: true }) );
server.use(express.text());
server.use(express.json());
server.use(cookieParser());

server.use('/api', adminOnly, routes);

// Authorization
server.post('/auth', (req, res) => {
    const { password } = req.body;
    if (Crypto.compare(password || '', SUPERADMIN_PASS || '')) {
        const token = createAdminToken();
        res.status(200).send(token);
    } else {
        res.sendStatus(401);
    }
});

server.get('/test', adminOnly, (req, res) => {
    res.sendStatus(204);
});

/***************** SOCKET SERVER *****************/

const io = new Server(httpServer, {
    cors: { origin: "*" },
    
});

io.use(admindOnlySocket);

/***************** SERVER START *****************/

console.log('Server listening at the port', serverPort);
httpServer.listen(serverPort);

/***************** TELEGRAM BOT *****************/

bot.on('message', (ctx, next) => {
    const { first_name, last_name, username } = ctx.update.message.from;
    let msg: string | undefined = (ctx.update.message as Message.TextMessage).text;
    if (msg) msg = msg.replace(/[\n\r\s\t]+/g, ' ');
    if (msg?.length > 50) msg = msg.slice(0, 47) + '...'; 
    console.log(`[${getBeautifulDate(ctx.update.message.date)}] NEW MESSAGE from ${first_name}${last_name ? ` ${last_name}` : ''}${username ? ` #${username}` : ''} : ${msg || 'Unsupported message'}`);

    db.saveMessage(ctx.update.message).subscribe();
    io.emit('new message', ctx.update.message);
    next();
});

bot.launch();


function getBeautifulDate(seconds: number): string {
    const date = new Date(seconds * 1000);
    return date.toLocaleString();
}


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))