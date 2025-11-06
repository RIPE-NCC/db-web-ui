import { Component } from '@angular/core';
import { LabelPipe } from './label.pipe';

@Component({
    selector: 'submitting-agreement',
    template: `<div class="help-block small">
        <section style="color: #3d3d3d">
            <span [innerHTML]="'msg.ripeTandCSubmitLink.text' | label"></span>
        </section>
    </div>`,
    standalone: true,
    imports: [LabelPipe],
})
export class SubmittingAgreementComponent {}
