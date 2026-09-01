import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export enum HealthCheckStatus {
    CHECKING = 'checking',
    ISSUES = 'issues',
    HEALTHY = 'healthy',
    FAILED = 'failed',
}

@Component({
    selector: 'health-check-card',
    templateUrl: './health-check-card.component.html',
    styleUrl: './health-check-card.component.scss',
    imports: [MatProgressSpinnerModule, MatIconModule],
})
export class HealthCheckCardComponent {
    status = input<HealthCheckStatus>(HealthCheckStatus.CHECKING);

    verified = input<number>(0);
    total = input<number>(0);
    issues = input<number>(0);

    refreshCheck = output<void>();

    protected readonly HealthCheckStatus = HealthCheckStatus;

    refresh(): void {
        this.refreshCheck.emit();
    }
}
