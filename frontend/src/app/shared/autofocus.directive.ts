import { AfterContentInit, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[autoFocusDirective]',
    standalone: false,
})
export class AutoFocusDirective implements AfterContentInit {
    constructor(private elRef: ElementRef) {}

    ngAfterContentInit(): void {
        this.elRef.nativeElement.focus();
    }
}
