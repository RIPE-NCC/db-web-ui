interface Organisation {
    id: string;
    name: string;
}

interface Lir {
    membershipId: number;
    regId: string;
    organisationName: string;
    serviceLevel: string;
    orgId: string;
}

interface OrgDropDownDataService {
    getLirs(): Lir[];
    getOrganisation(): Organisation[];
}
