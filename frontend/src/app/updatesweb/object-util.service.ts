import * as _ from 'lodash';
import { IAttributeModel } from '../shared/whois-response-type.model';

export class ObjectUtilService {
    public static isLirObject(attributes: any): boolean {
        return this.isAllocation(attributes) || attributes.filter((attr) => attr.name === 'org-type' && attr.value.trim() === 'LIR').length > 0;
    }

    public static isAllocation(attributes: IAttributeModel[]) {
        if (!attributes) {
            return false;
        }
        const allocationStatuses = ['ALLOCATED PA', 'ALLOCATED PI', 'ALLOCATED UNSPECIFIED', 'ALLOCATED-BY-RIR'];
        for (const attr of attributes) {
            if (attr.name.trim() === 'status') {
                return attr.value && _.includes(allocationStatuses, attr.value.trim());
            }
        }
        return false;
    }
}
