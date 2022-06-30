import { Component, EventEmitter, Input, Output } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { MessageTypeChecker } from 'src/app/utils/message-type-checker';
import { Message } from 'telegraf/typings/core/types/typegram';

@Component({
    selector: 'app-messages-list',
    templateUrl: './messages-list.component.html',
    styleUrls: ['./messages-list.component.scss']
})
export class MessagesListComponent {
    @Input() messages: Message[] = [];
    @Input() chatId: number | null = null;

    public messageModel: string = '';

    public isLoading$ = this.spinnerService.isActive;

    isTextMessage = MessageTypeChecker.isText;

    constructor(private apiService: ApiService, private spinnerService: SpinnerService) { }

    sendMessage(): void {
        if (!this.messageModel || !this.chatId) return;

        this.spinnerService.isActive.next(true);
        this.apiService.sendMessage(this.chatId, this.messageModel).pipe(
            finalize(() => {
                this.spinnerService.isActive.next(false);
            })
        ).subscribe({
            next: (message) => {
                this.apiService.newMessageSbj.next(message);
                this.messageModel = '';
            }
        });
    }

    isDifferentDays(msg1: Message, msg2?: Message): boolean {
        
        if (!msg2) return true;
        
        const date1 = new Date(msg1.date*1000);
        const date2 = new Date(msg2.date*1000);
        console.log(date1, date2);
        return date1.getDate() !== date2.getDate() || Math.abs(msg1.date - msg2.date) > 60*60*24;
    }

    isMyMessage(msg: Message): boolean {
        return msg.chat.id !== msg.from?.id;
    }

}
