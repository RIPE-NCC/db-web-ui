import {Component, Input} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "modal-yes-no-instance",
    templateUrl: "./modal-yes-no-instance.component.html",
})
export class ModalYesNoInstanceComponent {

    public close: any;
    public dismiss: any;
    public resolve: any;

    @Input()
    public msg: string;

    constructor(private activeModal: NgbActiveModal) {
    }

    public ngOnInit() {
    }

    public yes() {
        this.activeModal.close("yes");
    }

    public no() {
        this.activeModal.dismiss();
    }
}
