import { Component, Input, OnInit } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Labels } from '../label.constants';

@Component({
    selector: 'help-marker',
    template: `<span [ngbPopover]="titleLabel" placement="bottom" triggers="mouseenter:mouseleave">
        @if (hrefLabel) {
        <a [href]="hrefLabel" target="_blank"> <span class="fa-light fa-question fa-lg" aria-hidden="true"></span></a>
        } @if (!hrefLabel) {
        <span class="fa-light fa-question fa-lg" aria-hidden="true"></span>
        }
    </span>`,
    standalone: true,
    imports: [NgbPopover],
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
