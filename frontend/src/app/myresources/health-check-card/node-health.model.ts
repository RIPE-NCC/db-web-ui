import { WritableSignal } from '@angular/core';
import { ResourceCheck } from 'src/app/myresources/resource-type.model';
import { AnnouncementOptions } from 'src/app/myresources/tree/node-preview.component';

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
    resourceCheckStatus: WritableSignal<ResourceCheck[]>;
    announcementStatus: WritableSignal<AnnouncementOptions>;
    issuesCount: WritableSignal<number>;
    issuesCountOfChildren: WritableSignal<number>;
}

export interface NodeHealthState {
    status: NodeHealthStatus;
    issuesCount: number;
}
