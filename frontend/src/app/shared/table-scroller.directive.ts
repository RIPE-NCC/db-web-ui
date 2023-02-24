import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, HostListener, Inject, Output } from '@angular/core';

export function debounce(delay: number = 25): MethodDecorator {
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
    selector: '[table-scroller]',
})
export class TableScrollerDirective {
    @Output() scrolled = new EventEmitter();

    private lastRemaining = 9999;
    private lengthThreshold = 200;
    public constructor(private elRef: ElementRef, @Inject(DOCUMENT) private document: Document) {}

    @HostListener('scroll', ['$event'])
    @debounce()
    onListenerTriggered(event: UIEvent): void {
        // @ts-ignore
        const remaining = event.target.scrollHeight - (event.target.clientHeight + event.target.scrollTop);

        //if we have reached the threshold
        if (remaining < this.lengthThreshold && remaining - this.lastRemaining < 0) {
            this.scrolled.emit();
        }
        this.lastRemaining = remaining;
    }
}
