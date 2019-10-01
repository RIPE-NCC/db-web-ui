import {Component} from "@angular/core";

@Component({
    selector: "text-multi-decision-modal",
    templateUrl: "./text-multi-decision-modal.component.html",
})
export class TextMultiDecisionModalComponent {

    public close: any;
    public dismiss: any;
    public resolve: any;

    public onPoorClicked() {
        this.close({$value: false});
    }

    public onRichClicked() {
        this.close({$value: true});
    }

    public cancel() {
        this.close({$value: false});
    }
}
