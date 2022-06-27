import { Component, Input } from '@angular/core';
import { MessageTypeChecker } from 'src/app/utils/message-type-checker';
import { Message } from 'telegraf/typings/core/types/typegram';

@Component({
    selector: 'app-messages-list',
    templateUrl: './messages-list.component.html',
    styleUrls: ['./messages-list.component.scss']
})
export class MessagesListComponent {
    @Input() messages: Message[] = [];

    isTextMessage = MessageTypeChecker.isText;

    constructor() { }

}
