import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'modal-domain-object-splash',
    templateUrl: './modal-domain-object-splash.component.html',
    standalone: false,
})
export class ModalDomainObjectSplashComponent {
    constructor(public activeModal: NgbActiveModal) {}
}
