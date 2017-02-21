interface Ipv4Resource {
    prefix: string;
    status: string;
    whoisQueryUrl: string;
}

interface IPv4ResourcesResponse {
    orgid: string;
    details: IPv4ResourceDetails[];
}

interface IPv4ResourceDetails {
    range: IPv4ResourceRange;
    status: string;
}

interface IPv4ResourceRange {
    string: string;
    slash: string;
    start: number;
    end: number;
}

interface IMyResourcesDataService {
    getIpv4Resources(): Ipv4Resource[];
}
