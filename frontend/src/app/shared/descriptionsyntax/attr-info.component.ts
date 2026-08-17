import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { SanitizeHtmlPipe } from 'src/app/shared/sanitize-html.pipe';
import { WhoisMetaService } from '../whois-meta.service';

@Component({
    selector: 'attr-info',
    template: `<span [innerHTML]="text | sanitizeHtml"></span>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [SanitizeHtmlPipe],
})
export class AttributeInfoComponent implements OnInit {
    private whoisMetaService = inject(WhoisMetaService);

    @Input()
    public description: string;
    @Input()
    public objectType: string;
    @Input()
    public syntax: string;

    public text = '';

    public ngOnInit() {
        if (!this.objectType) {
            return;
        }
        if (this.description) {
            this.text = this.whoisMetaService.getAttributeDescription(this.objectType, this.description);
        } else if (this.syntax) {
            this.text = this.whoisMetaService.getAttributeSyntax(this.objectType, this.syntax);
        }
    }
}
