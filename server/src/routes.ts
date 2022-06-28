import { Router } from "express";
import { map } from "rxjs";
import { bot } from "./config";
import { db } from "./database";
import { Chat } from "./interfaces";

const routes = Router();
export default routes;

// Get list of all chats
routes.get('/chats', (req, res) => {
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

// Get all messages of the specific chat
routes.get('/chats/:chatId/messages', (req, res) => {
    const chatId = Number(req.params.chatId) || 0;

    db.getAllMessages().pipe(
        map((messages) => {
            const chatMessages = messages.filter(msg => msg.chat.id === chatId);
            chatMessages.sort((a, b) => b.date - a.date);
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

// Send message to the specific chat
routes.post('/message/:chatId', (req, res) => {
    const chatId = Number(req.params.chatId) || 0;
    const message: string = req.body;

    bot.telegram.sendMessage(chatId, message).then(() => {
        res.sendStatus(204);
    }).catch((err) => {
        console.error('Error sending message!', err);
        res.status(500).send(err);
    });    
});