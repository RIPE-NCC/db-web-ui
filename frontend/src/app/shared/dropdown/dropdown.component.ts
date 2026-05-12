import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownOption } from './types';

@Component({
    selector: 'db-dropdown',
    standalone: true,
    imports: [OverlayModule, PortalModule],
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {
    isOpen = false;

    @Input() label?: string;
    @Input() options: DropdownOption[] = [];
    @Input() placeholder? = 'Select option';

    @Input() selectedValue: any;
    @Output() selectedValueChange = new EventEmitter<any>();

    get selectedLabel(): string {
        return this.options.find((option) => option.value === this.selectedValue)?.label ?? this.placeholder;
    }

    toggle(): void {
        this.isOpen = !this.isOpen;
    }

    close(): void {
        this.isOpen = false;
    }

    select(option: any): void {
        this.selectedValue = option.value;
        this.close();
        this.selectedValueChange.emit(option.value);
    }
}
