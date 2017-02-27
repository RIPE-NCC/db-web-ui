interface DbOrg {
    id: string;
    name: string;
}

interface Organisation {
    orgId: string;
    name: string;
    activeOrg: string;
}

interface Lir {
    membershipId: number;
    regId: string;
    organisationName: string;
    serviceLevel: string;
    orgId: string;
}

interface OrgDropDownDataService {
    getOrgs(): IPromise<Organisation[]>;
}
