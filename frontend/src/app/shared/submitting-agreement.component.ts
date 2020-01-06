import {Component, EventEmitter, Output} from "@angular/core";

@Component({
    selector: "submitting-agreement",
    template: `<section class="supporting-text">
        <span [innerHTML]="'msg.ripeTandCSubmitLink.text' | label"></span>
    </section>`,
})
export class SubmittingAgreementComponent {
}
