import { WritableSignal } from '@angular/core';

export enum NodeHealthStatus {
    NOT_CHECKED = 'NOT_CHECKED',
    OK = 'OK',
    ISSUES = 'ISSUES',
    FAILED = 'FAILED',
}

export interface HealthCheckableNode {
    type: string;
    nodeName: string;

    healthStatus: WritableSignal<NodeHealthStatus>;
    issuesCount: WritableSignal<number>;
}

export interface NodeHealthState {
    status: NodeHealthStatus;
    issuesCount: number;
}
