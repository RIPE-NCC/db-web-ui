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

interface OrgDropDownStateService {
    getOrgs(): IPromise<Organisation[]>;

    //getOrg(): Organisation;

    //setOrg(orgId: Organisation|string): void;
}
