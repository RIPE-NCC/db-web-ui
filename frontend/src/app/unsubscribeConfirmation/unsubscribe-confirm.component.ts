import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './unsubscribe-confirm.component.html',
})
export class UnsubscribeConfirmationComponent implements OnInit {
    public messageId: string;

    constructor(public activatedRoute: ActivatedRoute) {}

    public ngOnInit() {
        this.messageId = this.activatedRoute.snapshot.paramMap.get('messageId');
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
