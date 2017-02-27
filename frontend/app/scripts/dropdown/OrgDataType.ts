interface DbOrg {
    id: string;
    name: string;
}

interface Organisation {
    orgId: string;
    name: string;
    activeOrg: string;      // TODO: [ES] rename to activeMembershipId or memberId
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

    getSelectedOrg(): {name: string, value: string};

    setSelectedOrg(org: {name: string, value: string}): void;
}
