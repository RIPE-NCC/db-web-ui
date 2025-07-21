import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { IAttributeModel, IStatusOption } from '../shared/whois-response-type.model';

//TODO: This class should be static
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
            'AGGREGATED-BY-LIR': [{ key: 'ASSIGNED PA', value: 'ASSIGNED PA' }],
            'ALLOCATED PA': [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' },
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' },
            ],
            'ALLOCATED UNSPECIFIED': [
                { key: 'ALLOCATED PA', value: 'ALLOCATED PA' },
                { key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED' },
                { key: 'ALLOCATED ASSIGNED PA', value: 'ALLOCATED ASSIGNED PA' },
                { key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST' },
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
                { key: 'LEGACY', value: 'LEGACY' }, // *
            ],
            LEGACY: [{ key: 'LEGACY', value: 'LEGACY' }],
            'LIR-PARTITIONED PA': [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' }, // *
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' }, // *
            ],
            'SUB-ALLOCATED PA': [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' }, // *
            ],
            default: [
                { key: 'AGGREGATED-BY-LIR', value: 'AGGREGATED-BY-LIR' },
                { key: 'ALLOCATED PA', value: 'ALLOCATED PA' },
                { key: 'ALLOCATED ASSIGNED PA', value: 'ALLOCATED ASSIGNED PA' },
                { key: 'ALLOCATED UNSPECIFIED', value: 'ALLOCATED UNSPECIFIED' },
                { key: 'ASSIGNED ANYCAST', value: 'ASSIGNED ANYCAST' },
                { key: 'ASSIGNED PA', value: 'ASSIGNED PA' },
                { key: 'ASSIGNED PI', value: 'ASSIGNED PI' },
                { key: 'LEGACY', value: 'LEGACY' },
                { key: 'LIR-PARTITIONED PA', value: 'LIR-PARTITIONED PA' },
                { key: 'SUB-ALLOCATED PA', value: 'SUB-ALLOCATED PA' },
            ],
        },
    };

    private static readonly rsMntnerStatuses = new Map<String, string[]>([
        ['inetnum', ['ALLOCATED PA', 'ALLOCATED UNSPECIFIED', 'ALLOCATED ASSIGNED PA', 'ASSIGNED ANYCAST']],
        ['inet6num', ['ASSIGNED PI', 'ASSIGNED ANYCAST', 'ALLOCATED-BY-RIR']],
    ]);
    private readonly ipv4StatusesWithUsage = ['ALLOCATED PA', 'SUB-ALLOCATED PA', 'LIR-PARTITIONED PA', 'ALLOCATED-ASSIGNED PA'];
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

    public static isRsStatus(attributes: IAttributeModel[], objectType: string) {
        if (!attributes) {
            return false;
        }
        for (const attr of attributes) {
            if (attr.name.trim() === 'status') {
                return attr.value && _.includes(ResourceStatusService.rsMntnerStatuses.get(objectType.toLowerCase()), attr.value.trim());
            }
        }
        return false;
    }

    public filterNonRsStatuses(objectType: string, parentState?: string) {
        let list = this.get(objectType, parentState);
        return list.filter((status) => !ResourceStatusService.rsMntnerStatuses.get(objectType.toLowerCase()).includes(status.key));
    }

    public get(objectType: string, parentState?: string): IStatusOption[] {
        if (!objectType || !this.statuses[objectType]) {
            return [];
        }
        let list = this.statuses[objectType][parentState || 'default'];
        if (!list) {
            // if no match on parentState then return all
            list = this.statuses[objectType].default || [];
        }
        return list;
    }
}
