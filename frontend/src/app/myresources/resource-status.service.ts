import { Injectable } from '@angular/core';
import { IStatusOption } from '../shared/whois-response-type.model';

@Injectable()
export class ResourceStatusService {
    private readonly statuses = {
        'aut-num': {
            default: [
                { key: 'ASSIGNED', value: 'ASSIGNED' },
                { key: 'LEGACY', value: 'LEGACY' },
                { key: 'OTHER', value: 'OTHER' },
            ],
        },
        inet6num: {
            'AGGREGATED-BY-LIR': [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ASSIGNED', value: 'ASSIGNED' },
            ],
            'ALLOCATED-BY-LIR': [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR' },
                { key: 'ASSIGNED', value: 'ASSIGNED' },
            ],
            'ALLOCATED-BY-RIR': [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR' },
                { key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR' },
                { key: 'ASSIGNED', value: 'ASSIGNED' },
                { key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST' },
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
            ],
            default: [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ALLOCATED-BY-LIR', value: 'ALLOCATED-BY-LIR' },
                { key: 'ALLOCATED-BY-RIR', value: 'ALLOCATED-BY-RIR' },
                { key: 'ASSIGNED', value: 'ASSIGNED' },
                { key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST' },
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
            ],
        },
        inetnum: {
            'ALLOCATED PA': [
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' },
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' },
            ],
            'ALLOCATED-ASSIGNED PA': [{ key: 'ALLOCATED PA', value: 'ALLOCATED PA' }],
            'ALLOCATED PI': [
                { key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST' }, // *
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
                { key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI' },
            ],
            'ALLOCATED UNSPECIFIED': [
                { key: 'ALLOCATED PA', value: 'ALLOCATED PA' },
                { key: 'ALLOCATED PI', value: 'ALLOCATED PI' },
                { key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED' },
                { key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST' },
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
                { key: 'LEGACY', value: 'LEGACY' }, // *
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' },
                { key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI' },
            ],
            'ASSIGNED PA': [
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' }, // *
            ],
            'ASSIGNED PI': [
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' }, // *
            ],
            'EARLY-REGISTRATION': [] as string[],
            LEGACY: [{ key: 'LEGACY', value: 'LEGACY' }],
            'LIR-PARTITIONED PA': [
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' }, // *
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' }, // *
            ],
            'LIR-PARTITIONED PI': [
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
                { key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI' }, // *
            ],
            'SUB_ALLOCATED PA': [
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' }, // *
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' }, // *
            ],
            default: [
                { key: 'ALLOCATED PA', value: 'ALLOCATED PA' },
                { key: 'ALLOCATED PI', value: 'ALLOCATED PI' },
                { key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED' },
                { key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST' },
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
                { key: 'EARLY-REGISTRATION', value: 'EARLY-REGISTRATION' },
                { key: 'LEGACY', value: 'LEGACY' },
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' },
                { key: 'LIR-PARTITIONED PI', value: 'LIR-PARTITIONED PI' },
                { key: 'NOT-SET', value: 'NOT-SET' },
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' },
            ],
        },
    };

    private readonly ipv4StatusesWithUsage = ['ALLOCATED PA', 'SUB-ALLOCATED PA', 'LIR-PARTITIONED PA'];
    private readonly ipv6StatusesWithUsage = ['ALLOCATED-BY-RIR', 'ALLOCATED-BY-LIR'];

    // check if usage have sense to be displayed
    public isResourceWithUsage(type: string, status: string): boolean {
        if (type.toLowerCase() === 'inetnum') {
            return this.ipv4StatusesWithUsage.indexOf(status) > -1;
        } else if (type.toLowerCase() === 'inet6num') {
            return this.ipv6StatusesWithUsage.indexOf(status) > -1;
        }
        return false;
    }

    public get(objectType: string, parentState?: string): IStatusOption[] {
        if (!objectType || !this.statuses[objectType]) {
            return [];
        }
        let list = this.statuses[objectType][parentState || 'default'];
        if (!list) {
            // if no match on parentState then return default
            list = this.statuses[objectType].default || [];
        }
        return list;
    }
}
