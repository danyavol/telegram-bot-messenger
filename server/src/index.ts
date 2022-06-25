import { admindOnlySocket, adminOnly, createAdminToken } from '@services/auth';
import { Crypto } from '@services/crypto';
import express from 'express';
import { bot, serverPort, SUPERADMIN_PASS } from './config';
import { db } from './database';
import routes from './routes';
import cookieParser from 'cookie-parser';
import { Server, Socket } from 'socket.io';
import http from 'http';





/***************** HTTP SERVER *****************/

const server = express();
const httpServer = http.createServer(server);
const io = new Server(httpServer, {
    cors: { origin: "*" },
    
});

server.use(express.text());
server.use(express.json());
server.use(cookieParser());

server.use('/api', adminOnly, routes);

// Authorization
server.post('/auth', async (req, res) => {
    const { password } = req.body;
    if (Crypto.compare(password || '', SUPERADMIN_PASS || '')) {
        createAdminToken(res);
        res.sendStatus(204);
    } else {
        res.sendStatus(401);
    }
});

/***************** SOCKET SERVER *****************/

io.use(admindOnlySocket);

/***************** SERVER START *****************/

console.log('Server listening at the port', serverPort);
httpServer.listen(serverPort);

/***************** TELEGRAM BOT *****************/

bot.on('message', (ctx, next) => {
    const { first_name, last_name, username } = ctx.update.message.from;
    console.log(`NEW MESSAGE from ${username} | ${first_name} ${last_name}`);
    db.saveMessage(ctx.update.message).subscribe();
    io.emit('new message', ctx.update.message);
    next();
});

bot.launch();



// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))