import { WritableSignal } from '@angular/core';
import { ResourceCheckType } from 'src/app/myresources/tree/node-preview.component';

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
    announcementStatus: WritableSignal<ResourceCheckType>;
    issuesCount: WritableSignal<number>;
}

export interface NodeHealthState {
    status: NodeHealthStatus;
    issuesCount: number;
}
