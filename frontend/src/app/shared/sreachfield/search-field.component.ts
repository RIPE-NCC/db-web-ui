import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoFocusDirective } from '../autofocus.directive';

@Component({
    selector: 'search-field',
    templateUrl: './search-field.component.html',
    styleUrl: 'search-field.component.scss',
    standalone: true,
    imports: [FormsModule, NgIf, AutoFocusDirective],
})
export class SearchFieldComponent {
    @Input()
    queryText: string;
    @Output()
    queryTextChange = new EventEmitter<string>();

    onInputChange(value: string) {
        this.queryTextChange.emit(value);
    }
}
