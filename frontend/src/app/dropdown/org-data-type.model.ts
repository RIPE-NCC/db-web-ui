export interface IUserInfoOrganisation {
    orgObjectId: string;
    organisationName: string;
    roles: string[];
    lir: boolean;
}

export interface IUserInfoRegistration extends IUserInfoOrganisation {
    membershipId: string;
    regId: string;
}

export interface IUserInfo {
    active: boolean;
    username: string;
    displayName: string;
    uuid: string;
}

export interface IUserInfoResponseData {
    user: IUserInfo;
    organisations: IUserInfoOrganisation[];
    members: IUserInfoRegistration[];
}
