import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, CollectionReference, doc, DocumentReference, Firestore, getDocs, getFirestore, setDoc } from 'firebase/firestore/lite';
import { catchError, EMPTY, first, from, map, Observable, ReplaySubject, switchMap, throwError } from "rxjs";
import { Message } from "telegraf/typings/core/types/typegram";

enum Collections {
    Messages = 'messages'
}

export class Database {
    private db: Firestore;
    private dbReady$ = new ReplaySubject<void>();

    constructor(
        dbConfig: FirebaseOptions,
        authConfig: { login: string, password: string }
    ) {
        const app = initializeApp(dbConfig);
        this.db = getFirestore(app)

        from(signInWithEmailAndPassword(getAuth(app), authConfig.login, authConfig.password)).pipe(
            first(),
            catchError((err) => {
                console.error('Error authentication!', err);
                return EMPTY;
            })
        ).subscribe(() => {
            this.dbReady$.next();
        });
    }

    saveMessage(message: Message): Observable<void> {
        const docId = `${message.chat.id}:${message.message_id}`;
        const ref = doc(this.db, Collections.Messages, docId) as DocumentReference<Message>;
        
        return this.dbReady$.pipe( 
            switchMap(() => from(setDoc(ref, message)).pipe(
                first(),
                catchError((err) => {
                    console.error('Error during saving message!', err);
                    return EMPTY;
                })
            ))
        );
    }

    getAllMessages(): Observable<Message[]> {
        const messagesRef = collection(this.db, Collections.Messages) as CollectionReference<Message>;
        
        return this.dbReady$.pipe( 
            switchMap(() => from(getDocs(messagesRef)).pipe(
                first(),
                map((snap) => {
                    return snap.docs.map((doc) => doc.data());
                }),
                catchError((err) => {
                    console.error('Error during getting all messages!', err);
                    return throwError(() => err);
                })
            ))
        );
    }
}