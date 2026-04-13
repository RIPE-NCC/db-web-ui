import { IUserInfoOrganisation, IUserInfoRegistration } from '../dropdown/org-data-type.model';

export enum KeyType {
    MAINTAINER = 'Maintainer',
    MY_RESOURCES = 'My Resources',
    IP_ANALYSER = 'IP Analyser',
}

export const restrictedKeys: Set<KeyType> = new Set([KeyType.MY_RESOURCES, KeyType.IP_ANALYSER]);

export const isMemberOrg = (selectedOrg: IUserInfoRegistration): boolean => {
    return !!selectedOrg && !!(selectedOrg as IUserInfoRegistration).membershipId;
};

export const isKeyDisabled = (key: KeyType, selectedOrg: IUserInfoOrganisation): boolean => {
    const isRestricted = restrictedKeys.has(key);
    const noValidOrg = !selectedOrg || !isMemberOrg(selectedOrg as IUserInfoRegistration);

    return isRestricted && noValidOrg;
};
