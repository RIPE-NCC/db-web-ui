import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'loading-indicator',
    templateUrl: './loading-indicator.component.html',
    styleUrl: 'loading-indicator.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [MatProgressSpinner],
})
export class LoadingIndicatorComponent {}
