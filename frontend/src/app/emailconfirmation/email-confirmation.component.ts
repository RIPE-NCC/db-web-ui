import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailConfirmationService } from './email-confirmation.service';

@Component({
    selector: 'email-confirmation',
    templateUrl: './email-confirm.component.html',
    standalone: false,
})
export class EmailConfirmationComponent implements OnInit {
    public token: string;
    public validEmail: boolean = false;
    public loading: boolean = true;

    constructor(public emailConfirmationService: EmailConfirmationService, public activatedRoute: ActivatedRoute) {}

    public ngOnInit() {
        this.token = this.activatedRoute.snapshot.queryParamMap.get('t');
        this.emailConfirmationService.confirmEmail(this.token).subscribe({
            next: () => {
                this.loading = false;
                this.validEmail = true;
            },
            error: () => {
                this.loading = false;
            },
        });
    }
}
