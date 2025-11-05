import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgbActiveModal, NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { interval } from 'rxjs';
import { PrefixService } from './prefix.service';

@Component({
    selector: 'modal-domain-creation-wait',
    templateUrl: './modal-domain-creation-wait.component.html',
    standalone: true,
    imports: [NgbProgressbar],
})
export class ModalDomainCreationWaitComponent implements OnInit, OnDestroy {
    private activeModal = inject(NgbActiveModal);
    private prefixService = inject(PrefixService);

    public close: any;
    public dismiss: any;
    public resolve: any;
    public done: number;
    public numberOfDomains: number;
    public pollingData: any;
    public loader: boolean;

    public ngOnInit() {
        this.done = 100;
        this.numberOfDomains = _.filter(this.resolve.attributes, (attr: any) => {
            return attr.name === 'reverse-zone';
        }).length;
        this.saving();
    }

    public saving() {
        this.loader = true;
        this.pollingData = interval(2000).subscribe(() => {
            this.prefixService.getDomainCreationStatus(this.resolve.source).subscribe({
                next: (response: any) => {
                    if (response.status === 200) {
                        this.loader = false;
                        this.activeModal.close(response);
                    } else if (response.status === 204) {
                        // nothing happening in the backend
                        this.loader = false;
                        this.activeModal.close(response);
                    }
                    console.log(response); // see console you get output every 5 sec
                },
                error: (failResponse: any) => {
                    this.activeModal.dismiss(failResponse);
                },
            });
        });
    }

    public goAway() {
        this.activeModal.dismiss();
    }

    public cancel() {
        this.activeModal.dismiss();
    }

    ngOnDestroy() {
        this.pollingData.unsubscribe();
    }
}
