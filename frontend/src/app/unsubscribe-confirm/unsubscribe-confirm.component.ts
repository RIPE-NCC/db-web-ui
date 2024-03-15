import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnsubscribeService } from '../unsubscribe/unsubscribe.service';

@Component({
    templateUrl: './unsubscribe-confirm.component.html',
})
export class UnsubscribeConfirmComponent implements OnInit {
    public messageId: string;
    public email: string;
    public loading: boolean = true;
    public isSucess: boolean = false;

    constructor(public unsubscribeService: UnsubscribeService, public activatedRoute: ActivatedRoute) {}

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
        const url = window.location.origin + `/db-web-ui/unsubscribe/${this.messageId}`;
        window.location.href = url;
    }

    public cancel() {
        const url = window.location.origin + `/db-web-ui/`;
        window.location.href = url;
    }
}
