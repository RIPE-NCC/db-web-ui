import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'node-status-warning',
    templateUrl: './node-status-warning.component.html',
    styleUrl: 'node-status-warning.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class NodeStatusWarningComponent {
    readonly title = input.required<string>();
    readonly description = input<string>();
}
