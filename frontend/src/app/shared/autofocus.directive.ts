import { AfterContentInit, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[autoFocusDirective]',
})
export class AutoFocusDirective implements AfterContentInit {
    constructor(private elRef: ElementRef) {}

    ngAfterContentInit(): void {
        this.elRef.nativeElement.focus();
    }
}
