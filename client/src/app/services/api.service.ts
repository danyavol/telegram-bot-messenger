import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, Subject, tap } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Message } from 'telegraf/typings/core/types/typegram';
import { Chat } from '../interfaces/chat.interface';

const tokenField = 'token';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    public newMessageSbj = new Subject<Message>();
    private isUserAuthorized: boolean = false;

    constructor(private http: HttpClient, private router: Router) {
        const socket = io(environment.socketUrl, {
            autoConnect: false,
            auth: (cb) => {
                cb({ token: localStorage.getItem(tokenField) });
            }
        });

        socket.on('new message', (newMsg: Message) => {
            this.newMessageSbj.next(newMsg);
        });

        socket.connect();
    }

    public getToken(password: string): Observable<string> {
        const path = `${environment.apiUrl}/auth`;
        return this.http.post(path, { password }, { headers: { 'skip-auth': '' }, responseType: 'text' }).pipe(
            tap((token) => {
                localStorage.setItem(tokenField, token);
            })
        );
    }

    public sendMessage(chatId: number, message: string): Observable<Message> {
        const path = `${environment.apiUrl}/api/message/${chatId}`;
        return this.http.post<Message>(path, message);
    }

    public getChats(): Observable<Chat[]> {
        const path = `${environment.apiUrl}/api/chats`;
        return this.http.get<Chat[]>(path);
    }

    public getChatMessages(chatId: number): Observable<Message[]> {
        const path = `${environment.apiUrl}/api/chats/${chatId}/messages`;
        return this.http.get<Message[]>(path);
    }

    public getMessagesUpdates(): Observable<Message> {
        return this.newMessageSbj.asObservable();
    }

    /**************** Authorization ****************/

    public logOut(): void {
        this.isUserAuthorized = false;
        localStorage.removeItem(tokenField);
        this.router.navigate(['/auth']);
    }

    public isAuthorized(): Observable<boolean> {
        if (this.isUserAuthorized) return of(true);

        const path = `${environment.apiUrl}/test`;
        return this.http.get<void>(path).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }
}
