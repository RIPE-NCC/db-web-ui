import { AfterViewInit, Directive, ElementRef, EventEmitter, OnDestroy, Output, inject } from '@angular/core';

@Directive({
    selector: '[scroller]',
    standalone: true,
})
export class ScrollerDirective implements AfterViewInit, OnDestroy {
    private el = inject(ElementRef);
    private observer!: IntersectionObserver;

    @Output() scrolled = new EventEmitter<void>();

    ngAfterViewInit() {
        this.observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    this.scrolled.emit();
                }
            },
            {
                threshold: 0.1,
            },
        );

        this.observer.observe(this.el.nativeElement);
    }

    ngOnDestroy() {
        this.observer.disconnect();
    }
}
