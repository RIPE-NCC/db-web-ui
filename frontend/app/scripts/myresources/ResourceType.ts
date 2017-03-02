interface IPv4ResourcesResponse {
    orgid: string;
    details: IPv4ResourceDetails[];
}

interface IPv4ResourceDetails {
    range: IPv4ResourceRange;
    status: string;
    netname: string;
}

interface IPv4ResourceRange {
    string: string;
    slash: string;
}

interface IMyResourcesDataService {
    getIpv4Resources(orgid: string, callback: {(response: IPv4ResourcesResponse): void}): void;
}
