import { Component, Input } from '@angular/core';
import { ShareLink } from './query.component';

@Component({
    selector: 'share-panel',
    templateUrl: './share-panel.component.html',
    standalone: false,
})
export class SharePanelComponent {
    @Input()
    public link: ShareLink;
}
