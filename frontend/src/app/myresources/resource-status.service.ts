import { Injectable } from '@angular/core';
import { IAttributeModel, IStatusOption } from '../shared/whois-response-type.model';

type ResourceType = 'aut-num' | 'inetnum' | 'inet6num';
type StatusList = readonly string[];
type ResourceStatuses = Partial<Record<string, StatusList>> & {
    default: StatusList;
};

const toStatusOptions = (statuses: StatusList): IStatusOption[] => statuses.map((status) => ({ key: status, value: status }));

@Injectable({ providedIn: 'root' })
export class ResourceStatusService {
    private static readonly STATUSES: Record<ResourceType, ResourceStatuses> = {
        'aut-num': {
            default: ['ASSIGNED', 'LEGACY', 'OTHER'],
        },

        inet6num: {
            'AGGREGATED-BY-LIR': ['AGGREGATED-BY-LIR', 'ASSIGNED'],
            'ALLOCATED-BY-LIR': ['AGGREGATED-BY-LIR', 'ALLOCATED-BY-LIR', 'ASSIGNED'],
            'ALLOCATED-BY-RIR': ['AGGREGATED-BY-LIR', 'ALLOCATED-BY-LIR', 'ALLOCATED-BY-RIR', 'ASSIGNED', 'ASSIGNED ANYCAST', 'ASSIGNED PI'],
            default: ['AGGREGATED-BY-LIR', 'ALLOCATED-BY-LIR', 'ALLOCATED-BY-RIR', 'ASSIGNED', 'ASSIGNED ANYCAST', 'ASSIGNED PI'],
        },

        inetnum: {
            'AGGREGATED-BY-LIR': ['ASSIGNED PA'],
            'ALLOCATED PA': ['AGGREGATED-BY-LIR', 'ASSIGNED PA', 'LIR-PARTITIONED PA', 'SUB-ALLOCATED PA'],
            'ALLOCATED UNSPECIFIED': ['ALLOCATED PA', 'ALLOCATED UNSPECIFIED', 'ALLOCATED ASSIGNED PA', 'ASSIGNED ANYCAST', 'ASSIGNED PI', 'LEGACY'],
            LEGACY: ['LEGACY'],
            'LIR-PARTITIONED PA': ['AGGREGATED-BY-LIR', 'ASSIGNED PA', 'LIR-PARTITIONED PA', 'SUB-ALLOCATED PA'],
            'SUB-ALLOCATED PA': ['AGGREGATED-BY-LIR', 'ASSIGNED PA', 'SUB-ALLOCATED PA'],
            default: [
                'AGGREGATED-BY-LIR',
                'ALLOCATED PA',
                'ALLOCATED ASSIGNED PA',
                'ALLOCATED UNSPECIFIED',
                'ASSIGNED ANYCAST',
                'ASSIGNED PA',
                'ASSIGNED PI',
                'LEGACY',
                'LIR-PARTITIONED PA',
                'SUB-ALLOCATED PA',
            ],
        },
    };

    private static readonly RS_MNTNER_STATUSES: Partial<Record<ResourceType, StatusList>> = {
        inetnum: ['ALLOCATED PA', 'ALLOCATED UNSPECIFIED', 'ALLOCATED ASSIGNED PA', 'ASSIGNED ANYCAST'],
        inet6num: ['ASSIGNED PI', 'ASSIGNED ANYCAST', 'ALLOCATED-BY-RIR'],
    };

    private static readonly STATUSES_WITH_USAGE: Partial<Record<ResourceType, StatusList>> = {
        inetnum: ['ALLOCATED PA', 'SUB-ALLOCATED PA', 'LIR-PARTITIONED PA', 'ALLOCATED-ASSIGNED PA'],
        inet6num: ['ALLOCATED-BY-RIR', 'ALLOCATED-BY-LIR'],
    };

    public get(objectType: string, parentState?: string): IStatusOption[] {
        const type = this.normalizeType(objectType);
        if (!type) {
            return [];
        }

        const statuses = ResourceStatusService.STATUSES[type];
        const list = statuses[parentState ?? 'default'] ?? statuses.default;

        return toStatusOptions(list);
    }

    public filterNonRsStatuses(objectType: string, parentState?: string): IStatusOption[] {
        const rsStatuses = ResourceStatusService.RS_MNTNER_STATUSES[this.normalizeType(objectType) ?? 'inetnum'] ?? [];

        return this.get(objectType, parentState).filter(({ key }) => !rsStatuses.includes(key));
    }

    // check if usage have sense to be displayed
    public isResourceWithUsage(type: string, status: string): boolean {
        const resourceType = this.normalizeType(type);

        return resourceType !== null && (ResourceStatusService.STATUSES_WITH_USAGE[resourceType] ?? []).includes(status);
    }

    public static isRsStatus(attributes: IAttributeModel[], objectType: string): boolean {
        if (!attributes) {
            return false;
        }

        const rsStatuses = ResourceStatusService.RS_MNTNER_STATUSES[ResourceStatusService.normalizeType(objectType) ?? 'aut-num'] ?? [];

        const statusAttribute = attributes.find(({ name }) => name.trim() === 'status');

        return !!statusAttribute?.value && rsStatuses.includes(statusAttribute.value.trim());
    }

    private static normalizeType(type: string): ResourceType | null {
        const normalized = type?.toLowerCase();

        return normalized && normalized in ResourceStatusService.STATUSES ? (normalized as ResourceType) : null;
    }

    private normalizeType(type: string): ResourceType | null {
        return ResourceStatusService.normalizeType(type);
    }
}
