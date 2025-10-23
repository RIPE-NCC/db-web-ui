import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IVersion } from '../shared/whois-response-type.model';

@Component({
    selector: 'whois-version',
    template: ` <div>
        <span *ngIf="version">RIPE Database Software Version {{ version.version }}</span>
    </div>`,
    styles: ['span { color: grey; }'],
    imports: [NgIf],
})
export class WhoisVersionComponent {
    @Input()
    public version: IVersion;
}
