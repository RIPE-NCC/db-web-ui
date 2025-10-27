import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { EmailConfirmationService } from './email-confirmation.service';

@Component({
    selector: 'email-confirmation',
    templateUrl: './email-confirm.component.html',
    imports: [NgIf, LoadingIndicatorComponent],
})
export class EmailConfirmationComponent implements OnInit {
    emailConfirmationService = inject(EmailConfirmationService);
    activatedRoute = inject(ActivatedRoute);

    public token: string;
    public validEmail: boolean = false;
    public loading: boolean = true;

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
