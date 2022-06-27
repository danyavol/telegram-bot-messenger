import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-auth-page',
    templateUrl: './auth-page.component.html',
    styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {

    public password: string = '';

    constructor(private apiService: ApiService, private router: Router) { }

    submit(): void {
        this.apiService.getToken(this.password).subscribe(() => {
            this.router.navigate(['']);
        });
    }

}
