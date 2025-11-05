import { AfterContentInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[autoFocusDirective]', standalone: true })
export class AutoFocusDirective implements AfterContentInit {
    private elRef = inject(ElementRef);

    ngAfterContentInit(): void {
        this.elRef.nativeElement.focus();
    }
}
