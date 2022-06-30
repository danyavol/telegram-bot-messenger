import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
    selector: 'app-auth-page',
    templateUrl: './auth-page.component.html',
    styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {

    public password: string = '';

    constructor(
        private apiService: ApiService, 
        private router: Router, 
        private spinnerService: SpinnerService
    ) { }

    submit(): void {
        this.spinnerService.isActive.next(true);
        this.apiService.getToken(this.password).pipe(
            finalize(() => {
                this.spinnerService.isActive.next(false);
            })
        ).subscribe(() => {
            this.router.navigate(['']);
        });
    }

}
