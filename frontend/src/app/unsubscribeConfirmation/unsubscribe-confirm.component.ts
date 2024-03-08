import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnsubscribeConfirmService } from './unsubscribe-confirm.service';

@Component({
    templateUrl: './unsubscribe-confirm.component.html',
})
export class UnsubscribeConfirmationComponent implements OnInit {
    public messageId: string;
    public email: string;
    public loading: boolean = true;
    public isSucess: boolean = false;

    constructor(public unsubscribeConfirmService: UnsubscribeConfirmService, public activatedRoute: ActivatedRoute) {}

    public ngOnInit() {
        this.messageId = this.activatedRoute.snapshot.paramMap.get('messageId');

        this.unsubscribeConfirmService.getEmailFromMessageId(this.messageId).subscribe({
            next: (response: any) => {
                console.log('email is : ' + response);

                this.email = response;
                this.loading = false;
                this.isSucess = true;
            },
            error: () => {
                console.log('Got error while fetching email id from message id');

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
