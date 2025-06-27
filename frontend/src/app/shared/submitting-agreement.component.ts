import { Component } from '@angular/core';

@Component({
    selector: 'submitting-agreement',
    template: `<div class="help-block small">
        <section style="color: #3d3d3d">
            <span [innerHTML]="'msg.ripeTandCSubmitLink.text' | label"></span>
        </section>
    </div>`,
    standalone: false,
})
export class SubmittingAgreementComponent {}
