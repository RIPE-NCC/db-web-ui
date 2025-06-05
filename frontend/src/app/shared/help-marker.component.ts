import { Component, Input, OnInit } from '@angular/core';
import { Labels } from '../label.constants';

@Component({
    selector: 'help-marker',
    template: `<span [ngbPopover]="titleLabel" placement="bottom" triggers="mouseenter:mouseleave">
        <a [href]="hrefLabel" *ngIf="hrefLabel" target="_blank"> <span class="fal fa-question fa-lg" aria-hidden="true"></span></a>
        <span *ngIf="!hrefLabel" class="fal fa-question fa-lg" aria-hidden="true"></span>
    </span>`,
    standalone: false,
})
export class HelpMarkerComponent implements OnInit {
    @Input()
    public labelKey: string;
    @Input()
    public link: string;

    public titleLabel: string;
    public hrefLabel: string;

    public ngOnInit() {
        this.titleLabel = Labels[this.labelKey];
        this.hrefLabel = this.link || undefined;
    }
}
