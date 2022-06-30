import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Chat as MyChatInterface } from 'src/app/interfaces/chat.interface';
import { MessageTypeChecker } from 'src/app/utils/message-type-checker';
import { Chat, Message } from 'telegraf/typings/core/types/typegram';

@Component({
    selector: 'app-chats-list',
    templateUrl: './chats-list.component.html',
    styleUrls: ['./chats-list.component.scss']
})
export class ChatsListComponent {
    @Input() chats: MyChatInterface[] = [];
    @Input() activeChatId: number | null = null;
    @Output() chatClick = new EventEmitter<number>();

    isTextMessage = MessageTypeChecker.isText;

    onChatClick(chatId: number): void {
        this.chatClick.emit(chatId);
    }
    
    isPrivateChat(chat: Chat): chat is Chat.PrivateChat {
        return chat.type === 'private';
    }

    isMyMessage(msg: Message): boolean {
        return msg.chat.id !== msg.from?.id;
    }
}
