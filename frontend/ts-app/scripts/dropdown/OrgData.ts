interface Lir {
    id: string;
    name: string;
}

interface Organisation {
    membershipId: number;
    regId: string;
    organisationName: string;
    serviceLevel: string;
    orgId: string;
}

interface OrgDropDownDataService {
    getOrganisations(): Organisation[];
    getLirs(): Lir[];
}
