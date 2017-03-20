interface IResourceModel {
    resource: string;
    type: string;
}

interface ResourceRange {
    string: string;
    slash: string;
    start: number; // TODO: Cannot use number for ipv6, JS numbers only go to 2^53
    end: number; // TODO: Cannot use number for ipv6, JS numbers only go to 2^53
}

interface Ipv4ResourceRange extends ResourceRange { }

interface IPv4ResourcesResponse {
    orgid: string;
    resources: IPv4ResourceDetails[];
}

interface IPv4ResourceDetails {
    range: Ipv4ResourceRange;
    status: string;
    netname: string;
}

interface Ipv6ResourceRange extends ResourceRange { }

interface IPv6ResourcesResponse {
    orgid: string;
    resources: IPv6ResourceDetails[];
}

interface IPv6ResourceDetails {
    range: Ipv6ResourceRange;
    status: string;
}

interface AsnResourcesResponse {
    orgid: string;
    resources: AsnResourceDetails[];
}

interface AsnResourceDetails {
    value: number;
}

interface IMyResourcesDataService {
    fetchIpv4Resources(orgId: string): IPromise<IPv4ResourcesResponse>;
    fetchIpv6Resources(orgId: string): IPromise<IPv6ResourcesResponse>;
    fetchAsnResources(orgId: string): IPromise<AsnResourcesResponse>;
    fetchSponsoredIpv4Resources(orgId: string): IPromise<IPv4ResourcesResponse>;
    fetchSponsoredIpv6Resources(orgId: string): IPromise<IPv6ResourcesResponse>;
    fetchSponsoredAsnResources(orgId: string): IPromise<AsnResourcesResponse>;
}
