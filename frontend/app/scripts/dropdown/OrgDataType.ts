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
