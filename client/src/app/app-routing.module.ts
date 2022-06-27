import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthPageComponent } from './containers/auth-page/auth-page.component';
import { ChatsPageComponent } from './containers/chats-page/chats-page.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
    {
        path: 'auth',
        component: AuthPageComponent
    },
    {
        path: 'chats',
        canActivate: [AuthGuard],
        component: ChatsPageComponent
    },
    { path: '**', redirectTo: 'chats', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
