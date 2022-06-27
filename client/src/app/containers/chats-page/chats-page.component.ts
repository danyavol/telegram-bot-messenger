import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, mergeWith, Observable, startWith, switchMap, tap } from 'rxjs';
import { Chat } from 'src/app/interfaces/chat.interface';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-chats-page',
    templateUrl: './chats-page.component.html',
    styleUrls: ['./chats-page.component.scss']
})
export class ChatsPageComponent {

    currentChatId$ = new BehaviorSubject<number>(0);
    newMessage$ = this.apiService.getMessagesUpdates();

    chats$: Observable<Chat[]> = combineLatest([
        this.apiService.getChats(), 
        this.newMessage$.pipe(startWith(null))  // TODO: Doesn't work with multiple new messages
    ]).pipe(
        map(([chats, newMessage]) => {
            if (!newMessage) return chats;

            const existingChat = chats.find(chat => chat.chatId === newMessage.chat.id);
            if (existingChat) {
                existingChat.lastMessage = newMessage;
                return chats;
            } else {
                return [{ chatId: newMessage.chat.id, lastMessage: newMessage }, ...chats];
            }
        })
    );

    messages$ = this.currentChatId$.pipe(
        switchMap((chatId) => 
            combineLatest([
                this.apiService.getChatMessages(chatId),
                this.newMessage$.pipe(startWith(null)) // TODO: Doesn't work with multiple new messages
            ]).pipe(
                map(([messages, newMessage]) => {
                    if (messages.length && messages[0].chat.id === newMessage?.chat.id) {
                        return [...messages, newMessage];
                    } else {
                        return messages;
                    }
                }),
                tap(console.log)
            )
        )
    );
    

    constructor(private apiService: ApiService) {
        this.apiService.connectToSocket();
    }

    onChatClick(chatId: number): void {
        this.currentChatId$.next(chatId);
    }

}
