import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'refresh',
    template: `<p class="resource-page-message">
        {{ reason }}
        <button mat-mini-fab color="primary" class="margin-left" (click)="refresh()">
            <i class="fal fa-redo"></i>
        </button>
    </p>`,
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
