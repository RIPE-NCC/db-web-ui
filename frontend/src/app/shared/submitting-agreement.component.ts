import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SanitizeHtmlPipe } from 'src/app/shared/sanitize-html.pipe';
import { LabelPipe } from './label.pipe';

@Component({
    selector: 'submitting-agreement',
    template: `<div class="help-block small">
        <section style="color: #3d3d3d">
            <span [innerHTML]="'msg.ripeTandCSubmitLink.text' | label | sanitizeHtml"></span>
        </section>
    </div>`,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [LabelPipe, SanitizeHtmlPipe],
})
export class SubmittingAgreementComponent {}
