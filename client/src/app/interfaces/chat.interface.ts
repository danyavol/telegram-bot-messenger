import { Message } from "telegraf/typings/core/types/typegram";

export interface Chat {
    chatId: number;
    lastMessage: Message;
}