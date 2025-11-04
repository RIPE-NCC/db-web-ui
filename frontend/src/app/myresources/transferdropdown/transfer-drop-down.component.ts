import { NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { PropertiesService } from '../../properties.service';

@Component({
    selector: 'transfer-drop-down',
    templateUrl: './transfer-drop-down.component.html',
    imports: [NgbDropdown, MatButton, NgbDropdownToggle, NgIf, NgbDropdownMenu, NgbDropdownItem],
})
export class TransferDropDownComponent {
    properties = inject(PropertiesService);

    @Input()
    public sponsoredMenu: boolean;
}
