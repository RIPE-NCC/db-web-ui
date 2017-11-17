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

interface IIPv4ResourceDetails {
    range: IResourceRangeModel;
    status: string;
    netname: string;
    usage: IUsage;
}

interface IIPv6ResourceDetails {
    range: IResourceRangeModel;
    status: string;
    usage: IUsage;
}

interface IAsnResourceDetails {
    value: number;
}

interface IIPv6ResourcesResponse {
    orgid: string;
    resources: IIPv6ResourceDetails[];
}

interface IIPv4ResourcesResponse {
    orgid: string;
    resources: IIPv4ResourceDetails[];
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

    fetchParentResources(resource: IResourceModel, org: string): ng.IPromise<ng.IHttpResponse<string[]>>;

    fetchIpv4Resource(objectName: string): ng.IPromise<ng.IHttpResponse<IIPv4ResourcesResponse>>;

    fetchIpv6Resource(objectName: string): ng.IPromise<ng.IHttpResponse<IIPv6ResourcesResponse>>;

    fetchResources(orgId: string,
                   resource: string,
                   sponsored: boolean): ng.IPromise<ng.IHttpPromiseCallbackArg<IResourceOverviewResponseModel>>;

    fetchTicketsAndDates(orgId: string, resource: string): ng.IPromise<ng.IHttpResponse<IResourceTickets>>;
}
