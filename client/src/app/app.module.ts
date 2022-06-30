import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatsListComponent } from './components/chats-list/chats-list.component';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { AuthPageComponent } from './containers/auth-page/auth-page.component';
import { ChatsPageComponent } from './containers/chats-page/chats-page.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MessageDatePipe } from './pipes/date.pipe';

import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru-BY';
registerLocaleData(localeRu);

@NgModule({
    declarations: [
        AppComponent,
        AuthPageComponent,
        ChatsPageComponent,
        ChatsListComponent,
        MessagesListComponent,
        MessageDatePipe
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        MatCardModule,
        MatProgressBarModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        { provide: LOCALE_ID, useValue: 'ru-BY' },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
