interface IResourceModel {
    resource: string;
    type: string;
}

interface IResourceRangeModel {
    string: string;
    slash: string;
    start: number;
    end: number;
}

interface IPv4ResourceDetails {
    range: IResourceRangeModel;
    status: string;
    netname: string;
    usage: IUsage;
}

interface IPv6ResourceDetails {
    range: IResourceRangeModel;
    status: string;
    usage: IUsage;
}

interface AsnResourceDetails {
    value: number;
}

interface IPv6ResourcesResponse {
    orgid: string;
    resources: IPv6ResourceDetails[];
}

interface AsnResourcesResponse {
    orgid: string;
    resources: AsnResourceDetails[];
}

interface IPv4ResourcesResponse {
    orgid: string;
    resources: IPv4ResourceDetails[];
}

// from backend
interface IUsage {
    total: number;
    used: number;
    blockSize: number;
    free?: number; // calculated in f/e
}

interface IResourceTickets {
    tickets: {
        [resourceName: string]: ITicket[];
    };
}

interface ITicket {
    number: string;
    date: string;
    resource: string;
}

interface IResourceScreenItem {
    resource: string;
    status: string;
    type: string;
    usage: IUsage;
}

interface IResourcesDataService {
    fetchParentResources(resource: IResourceModel, org: string): IPromise<string[]>;

    fetchIpv4Resource(objectName: string): IPromise<IPv4ResourcesResponse>;
    fetchIpv6Resource(objectName: string): IPromise<IPv6ResourcesResponse>;

    fetchResources(orgId: string, resource: string, sponsored: boolean): IPromise<any>;

    fetchTicketsAndDates(orgId: string, resource: string): IPromise<IResourceTickets>;
}
