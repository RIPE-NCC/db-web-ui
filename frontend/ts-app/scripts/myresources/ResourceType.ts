interface Ipv4Resource {
    prefix: string;
    status: string;
    whoisQueryUrl: string;
}

interface IMyResourcesDataService {
    getIpv4Resources(): Ipv4Resource[];
}
