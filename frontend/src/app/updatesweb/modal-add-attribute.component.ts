import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FilteroutAttributeByNamePipe } from '../shared/filterout-attribute-by-name.pipe';

@Component({
    selector: 'modal-add-attribute',
    templateUrl: './modal-add-attribute.component.html',
    imports: [FormsModule, NgFor, MatButton, FilteroutAttributeByNamePipe],
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
