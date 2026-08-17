import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SanitizeHtmlPipe } from 'src/app/shared/sanitize-html.pipe';
import { IAttributeModel } from '../shared/whois-response-type.model';

@Component({
    selector: 'attribute-reverse-zones',
    templateUrl: './attribute-reverse-zones.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [SanitizeHtmlPipe],
})
export class AttributeReverseZonesComponent {
    @Input()
    public attribute: IAttributeModel;
}
