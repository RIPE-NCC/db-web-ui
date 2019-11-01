import {Component, EventEmitter, Output} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "modal-domain-object-splash",
    templateUrl: "./modal-domain-object-splash.component.html",
})
export class ModalDomainObjectSplashComponent {

    @Output()
    public close = new EventEmitter();
    @Output()
    public dismiss = new EventEmitter();

    constructor(public activeModal: NgbActiveModal) {}

}
