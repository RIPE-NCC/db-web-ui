import {Component} from "@angular/core";

@Component({
    selector: "submitting-agreement",
    template: `<div class="help-block small">
                    <section class="supporting-text">
                         <span [innerHTML]="'msg.ripeTandCSubmitLink.text' | label"></span>
                    </section>
               </div>`,
})
export class SubmittingAgreementComponent {
}
