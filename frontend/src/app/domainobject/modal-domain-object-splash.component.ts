import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'modal-domain-object-splash',
    templateUrl: './modal-domain-object-splash.component.html',
    standalone: true,
    imports: [MatButton],
})
export class ModalDomainObjectSplashComponent {
    activeModal = inject(NgbActiveModal);
}
