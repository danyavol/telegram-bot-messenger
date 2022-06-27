import { Message } from "telegraf/typings/core/types/typegram";

export class MessageTypeChecker {
    static isText(message: Message): message is Message.TextMessage {
        return (message as Message.TextMessage).text != null;
    }
}