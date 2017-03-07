interface DbOrg {
    id: string;
    name: string;
}

interface Organisation {
    orgId: string;
    orgName: string;
    memberId: string;
    regId: string;
    displayName: string; // Name shown in dropdown
}

interface Lir {
    membershipId: number;
    regId: string;
    organisationName: string;
    serviceLevel: string;
    orgId: string;
}

interface IOrgDropDownDataService {
    getOrgs(): IPromise<Organisation[]>;
}

interface IOrgDropDownStateService {
    getOrgs(): IPromise<Organisation[]>;

    getSelectedOrg(): IPromise<Organisation>;

    setSelectedOrg(org: Organisation): void;
}
