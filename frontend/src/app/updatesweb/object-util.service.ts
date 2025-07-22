import { ResourceStatusService } from '../myresources/resource-status.service';

export class ObjectUtilService {
    public static isLirObject(attributes: any, objectType: string): boolean {
        return ResourceStatusService.isRsStatus(attributes, objectType) || ObjectUtilService.containsLirOrgType(attributes);
    }

    public static containsLirOrgType(attributes: any) {
        return attributes.filter((attr: { name: string; value: string }) => attr.name === 'org-type' && attr.value.trim() === 'LIR').length > 0;
    }
}
