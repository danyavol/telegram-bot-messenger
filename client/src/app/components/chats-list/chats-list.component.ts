import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Chat } from 'src/app/interfaces/chat.interface';
import { MessageTypeChecker } from 'src/app/utils/message-type-checker';

@Component({
    selector: 'app-chats-list',
    templateUrl: './chats-list.component.html',
    styleUrls: ['./chats-list.component.scss']
})
export class ChatsListComponent {
    @Input() chats: Chat[] = [];
    @Input() activeChatId?: number;
    @Output() chatClick = new EventEmitter<number>();

    isTextMessage = MessageTypeChecker.isText;

    onChatClick(chatId: number): void {
        this.chatClick.emit(chatId);
    }
}
