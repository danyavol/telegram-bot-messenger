import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private apiService: ApiService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (request.headers.has('skip-auth')) {
            return next.handle(request);
        }
        
        const authReq = request.clone({
            headers: request.headers.set('token', localStorage.getItem('token') || '')
        });

        return next.handle(authReq).pipe(
            tap({ 
                error: (err) => {
                    if (err instanceof HttpErrorResponse && err.status === 401) {
                        this.apiService.logOut();
                    } 
                }
            })
        );
    }
}
