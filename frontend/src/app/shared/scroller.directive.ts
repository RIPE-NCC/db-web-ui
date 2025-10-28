import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

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

@Directive({ selector: '[scroller]' })
export class ScrollerDirective {
    private elRef = inject(ElementRef);

    @Output() scrolled = new EventEmitter();

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
