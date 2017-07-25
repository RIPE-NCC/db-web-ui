interface IUserInfoOrganisation {
    orgObjectId: string;
    organisationName: string;
    roles: string[];
}

interface IUserInfoRegistration extends IUserInfoOrganisation {
    membershipId: string;
    regId: string;
}

interface IUserInfo {
    active: boolean;
    username: string;
    displayName: string;
    uuid: string;

}
interface IUserInfoResponseData {
    user: IUserInfo;
    organisations: IUserInfoOrganisation[];
    members: IUserInfoRegistration[];
}
