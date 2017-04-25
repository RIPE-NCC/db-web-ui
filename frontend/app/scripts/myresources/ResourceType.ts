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

interface IUsage {
    total: number;
    used: number;
    free: number;
    blockSize: number;
}

interface IResourcesDataService {
    fetchParentResources(resource: IResourceModel, org: string): IPromise<string[]>;
    fetchIpv4Resources(orgId: string, pageNr: number): IPromise<IPv4ResourcesResponse>;
    fetchIpv4Resource(objectName: string): IPromise<IPv4ResourcesResponse>;
    fetchIpv6Resources(orgId: string, pageNr: number): IPromise<IPv6ResourcesResponse>;
    fetchIpv6Resource(objectName: string): IPromise<IPv6ResourcesResponse>;
    fetchAsnResources(orgId: string, pageNr: number): IPromise<AsnResourcesResponse>;
    fetchSponsoredIpv4Resources(orgId: string, pageNr: number): IPromise<IPv4ResourcesResponse>;
    fetchSponsoredIpv6Resources(orgId: string, pageNr: number): IPromise<IPv6ResourcesResponse>;
    fetchSponsoredAsnResources(orgId: string, pageNr: number): IPromise<AsnResourcesResponse>;
}
