import {Component, EventEmitter, Output} from "@angular/core";

@Component({
    selector: "submitting-agreement",
    template: `<section class="supporting-text">
        <p>By submitting this form you explicitly express your agreement with the 
            <a href="https://www.ripe.net/db/support/db-terms-conditions.html" target="_blank">RIPE Database Terms and Conditions</a>.</p>
    </section>
    <article class="pull-right">
        <button class="grey-button" (click)="btnCancelClicked()">Cancel</button>
        <button class="blue-button" (click)="btnSubmitClicked()">Submit</button>
    </article>`,
})
export class SubmittingAgreementComponent {

    @Output("submit-clicked")
    public submitClicked = new EventEmitter();
    @Output("cancel-clicked")
    public cancelClicked = new EventEmitter();

    btnCancelClicked() {
        this.cancelClicked.emit();
    }

    btnSubmitClicked() {
        this.submitClicked.emit();
    }
}
