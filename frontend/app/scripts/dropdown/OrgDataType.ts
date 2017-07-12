interface IDbOrg {
    id: string;
    name: string;
}

interface IOrganisationModel {
    orgId: string;
    orgName: string;
    memberId: string;
    regId: string;
    displayName: string; // Name shown in dropdown
}

interface ILirModel {
    membershipId: number;
    regId: string;
    organisationname: string;
    serviceLevel: string;
    orgId: string;
}

interface ILirDataService {
    getOrgs(): IPromise<IOrganisationModel[]>;
}

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
