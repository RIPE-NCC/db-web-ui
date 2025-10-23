import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { UnsubscribeService } from './unsubscribe.service';

@Component({
    templateUrl: './unsubscribe.component.html',
    imports: [NgIf, LoadingIndicatorComponent],
})
export class UnsubscribeComponent implements OnInit {
    public messageId: string;
    public email: string;
    public unsubscribed: boolean = false;
    public loading: boolean = true;

    constructor(public unsubscribeService: UnsubscribeService, public activatedRoute: ActivatedRoute) {}

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
