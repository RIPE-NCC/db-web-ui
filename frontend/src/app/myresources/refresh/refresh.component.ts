import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
    selector: "refresh",
    template: `<p class="resource-page-message"> 
                    {{ reason }} <button (click)="refresh()" class="fal fa-redo"></button>
               </p>`,
})
export class RefreshComponent {

    @Input()
    public reason: string;

    @Output("refresh")
    public refreshClbk = new EventEmitter();

    public refresh() {
        this.refreshClbk.emit();
    }
}
