import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnsubscribeService } from '../unsubscribe/unsubscribe.service';

@Component({
    templateUrl: './unsubscribe-confirm.component.html',
    standalone: false,
})
export class UnsubscribeConfirmComponent implements OnInit {
    public messageId: string;
    public email: string;
    public loading: boolean = true;
    public isSucess: boolean = false;

    constructor(public unsubscribeService: UnsubscribeService, public router: Router, public activatedRoute: ActivatedRoute) {}

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
