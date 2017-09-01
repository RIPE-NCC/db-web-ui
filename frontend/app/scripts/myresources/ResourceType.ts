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

interface IResourceOverviewResponseModel {
    filteredSize: number;
    stats: any;
    resources: any[];
}
interface IResourceScreenItem {
    netname?: string;
    asname?: string;

    resource: string;
    status: string;
    type: string;
    usage: IUsage;
    notRipeRegistered: boolean;
    sponsoredByOther: boolean;
}


interface IResourceDetailsResponseModel {
    resources: IMoreSpecificResource[];
    totalNumberOfResources: number;
    filteredSize: number;
    object?: IWhoisObjectModel;
    notUnderContract?: boolean;
    sponsoredByOther?: boolean;
}

interface IResourcesDataService {

    fetchParentResources(resource: IResourceModel, org: string): ng.IPromise<string[]>;

    fetchIpv4Resource(objectName: string): ng.IPromise<IPv4ResourcesResponse>;

    fetchIpv6Resource(objectName: string): ng.IPromise<IPv6ResourcesResponse>;

    fetchResources(orgId: string, resource: string, sponsored: boolean): ng.IPromise<ng.IHttpPromiseCallbackArg<IResourceOverviewResponseModel>>;

    fetchTicketsAndDates(orgId: string, resource: string): ng.IPromise<IResourceTickets>;
}
