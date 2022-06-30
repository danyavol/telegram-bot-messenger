import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, merge, Observable, ReplaySubject, scan, switchMap, tap } from 'rxjs';
import { Chat } from 'src/app/interfaces/chat.interface';
import { ApiService } from 'src/app/services/api.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Message } from 'telegraf/typings/core/types/typegram';

enum EmitType {
    NewMessage,
    ChatMessages,
    ChatsList
}

@Component({
    selector: 'app-chats-page',
    templateUrl: './chats-page.component.html',
    styleUrls: ['./chats-page.component.scss']
})
export class ChatsPageComponent {

    currentChatIdSbj = new ReplaySubject<number>();
    currentChatId$ = this.currentChatIdSbj.asObservable().pipe(
        tap((chatId) => this.router.navigate([], { queryParams: { id: chatId } }))
    );
    newMessage$ = this.apiService.getMessagesUpdates();

    chats$: Observable<Chat[]> = merge(
        this.apiService.getChats().pipe(map(value => ({ type: EmitType.ChatsList, value }))), 
        this.newMessage$.pipe(map(value => ({ type: EmitType.NewMessage, value })))
    ).pipe(
        scan((allChats, emit) => {
            if (emit.type === EmitType.ChatsList) return emit.value as Chat[];

            const newMessage = emit.value as Message;
            const chatIndex = allChats.findIndex(chat => chat.chatId === newMessage.chat.id);
            if (chatIndex < 0) {
                return [{ chatId: newMessage.chat.id, lastMessage: newMessage }, ...allChats];
            } else {
                const chat = allChats.splice(chatIndex, 1)[0];
                chat.lastMessage = newMessage;
                return [chat, ...allChats];
            }
        }, [] as Chat[])
    );

    messages$ = this.currentChatId$.pipe(
        tap(() => this.spinnerService.isActive.next(true)),
        switchMap((chatId) => 
            merge(
                this.apiService.getChatMessages(chatId).pipe(map(value => ({ type: EmitType.ChatMessages, value }))),
                this.newMessage$.pipe(map(value => ({ type: EmitType.NewMessage, value })))
            ).pipe(
                scan((allMessages, emit) => {
                    if (emit.type === EmitType.ChatMessages) return emit.value as Message[];

                    const newMessage = emit.value as Message;
                    if (allMessages[0]?.chat.id === newMessage.chat.id) {
                        return [newMessage, ...allMessages]
                    } else {
                        return allMessages;
                    }
                }, [] as Message[]),
                tap(() => this.spinnerService.isActive.next(false)),
            )
        )
    );
    
    constructor(
        private apiService: ApiService, 
        private spinnerService: SpinnerService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        setTimeout(() => {
            const chatId = Number(this.route.snapshot.queryParamMap.get('id'));
            if (chatId) this.currentChatIdSbj.next(chatId);
        });
    }

    onChatClick(chatId: number): void {
        this.currentChatIdSbj.next(chatId);
    }
}
