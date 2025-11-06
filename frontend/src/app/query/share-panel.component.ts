import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { ShareLink } from './query.component';

@Component({
    selector: 'share-panel',
    templateUrl: './share-panel.component.html',
    standalone: true,
    imports: [MatTooltip, MatInput, MatButton, CdkCopyToClipboard],
})
export class SharePanelComponent {
    @Input()
    public link: ShareLink;
}
