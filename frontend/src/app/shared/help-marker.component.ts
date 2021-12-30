import {Component, Input} from "@angular/core";
import {Labels} from "../label.constants";

@Component({
    selector: "help-marker",
    template: `<span [ngbPopover]="titleLabel"
                     placement="bottom"
                     triggers="mouseenter:mouseleave">
                    <a [href]="hrefLabel" *ngIf="hrefLabel" target="_blank">
                        <span class="fal fa-question fa-lg" aria-hidden="true"></span></a>
                    <span *ngIf='!hrefLabel' class="fal fa-question fa-lg" aria-hidden="true"></span>
               </span>`,
})
export class HelpMarkerComponent {
    // Inputs
    @Input("label-key")
    public labelKey: string;
    @Input()
    public link: string;

    // Outputs
    public titleLabel: string;
    public hrefLabel: string;

    constructor() {}

    public ngOnInit() {
        this.titleLabel = Labels[this.labelKey];
        this.hrefLabel = this.link || undefined;
    }
}
