import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'loading-indicator',
    templateUrl: './loading-indicator.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class LoadingIndicatorComponent {}
