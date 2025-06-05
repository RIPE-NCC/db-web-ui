import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'modal-add-attribute',
    templateUrl: './modal-add-attribute.component.html',
    standalone: false,
})
export class ModalAddAttributeComponent implements OnInit {
    public close: any;
    public dismiss: any;
    public resolve: any;

    @Input()
    public items: any;
    public selected: any;

    public constructor(private activeModal: NgbActiveModal) {}

    public ngOnInit() {
        this.orderItemsByName();
        this.selected = this.items[0];
    }

    public ok() {
        this.activeModal.close(this.selected);
    }

    public cancel() {
        this.activeModal.dismiss();
    }

    private orderItemsByName() {
        this.items.sort((itemA: any, itemB: any) => itemA.name.localeCompare(itemB.name));
    }
}
