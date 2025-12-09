import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { UnsubscribeService } from './unsubscribe.service';

@Component({
    templateUrl: './unsubscribe.component.html',
    standalone: true,
    imports: [LoadingIndicatorComponent],
})
export class UnsubscribeComponent implements OnInit {
    unsubscribeService = inject(UnsubscribeService);
    activatedRoute = inject(ActivatedRoute);

    public messageId: string;
    public email: string;
    public unsubscribed: boolean = false;
    public loading: boolean = true;

    public ngOnInit() {
        this.messageId = this.activatedRoute.snapshot.paramMap.get('messageId');
        this.unsubscribeService.unsubscribe(this.messageId).subscribe({
            next: (response: string) => {
                this.email = response;
                this.loading = false;
                this.unsubscribed = true;
            },
            error: () => {
                this.loading = false;
                this.unsubscribed = false;
            },
        });
    }
}
