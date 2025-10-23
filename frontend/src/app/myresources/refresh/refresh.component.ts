import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';

@Component({
    selector: 'refresh',
    template: `<p class="resource-page-message">
        {{ reason }}
        <button mat-mini-fab color="primary" class="margin-left" (click)="refresh()">
            <em class="fal fa-redo"></em>
        </button>
    </p>`,
    imports: [MatMiniFabButton],
})
export class RefreshComponent {
    @Input()
    public reason: string;

    @Output()
    public refreshClbk = new EventEmitter();

    public refresh() {
        this.refreshClbk.emit();
    }
}
