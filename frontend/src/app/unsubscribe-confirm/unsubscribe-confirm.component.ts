import { Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { UnsubscribeService } from '../unsubscribe/unsubscribe.service';

@Component({
    templateUrl: './unsubscribe-confirm.component.html',
    standalone: true,
    imports: [LoadingIndicatorComponent, MatButton],
})
export class UnsubscribeConfirmComponent implements OnInit {
    unsubscribeService = inject(UnsubscribeService);
    router = inject(Router);
    activatedRoute = inject(ActivatedRoute);

    public messageId: string;
    public email: string;
    public loading: boolean = true;
    public isSucess: boolean = false;

    public ngOnInit() {
        this.messageId = this.activatedRoute.snapshot.paramMap.get('messageId');

        this.unsubscribeService.getEmailFromMessageId(this.messageId).subscribe({
            next: (response: string) => {
                this.email = response;
                this.loading = false;
                this.isSucess = true;
            },
            error: () => {
                this.loading = false;
                this.isSucess = false;
            },
        });
    }

    public confirm() {
        void this.router.navigate(['unsubscribe', this.messageId]);
    }

    public cancel() {
        void this.router.navigate(['query']);
    }
}
