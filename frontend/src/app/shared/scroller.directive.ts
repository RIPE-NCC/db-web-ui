import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

export function debounce(delay: number = 100): MethodDecorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let timeout: any = null;
        const original = descriptor.value;

        descriptor.value = function (...args: any[]) {
            clearTimeout(timeout);
            timeout = setTimeout(() => original.apply(this, args), delay);
        };

        return descriptor;
    };
}

@Directive({
    selector: '[scroller]',
    standalone: false,
})
export class ScrollerDirective {
    @Output() scrolled = new EventEmitter();

    public constructor(private elRef: ElementRef) {}

    @HostListener('window:scroll', ['$event'])
    @debounce()
    onListenerTriggered(event: UIEvent): void {
        const nearly =
            this.elRef.nativeElement.getBoundingClientRect().top > 0 &&
            this.elRef.nativeElement.getBoundingClientRect().top < document.documentElement.clientHeight + document.body.scrollTop;
        // Emit the event
        if (nearly) {
            this.scrolled.emit();
        }
    }
}
