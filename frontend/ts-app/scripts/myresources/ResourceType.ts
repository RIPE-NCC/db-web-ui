interface Ipv4Allocation {
    date: string;
    prefix: string;
    size: number;
    status: string;
    whoisQueryUrl: string;
}

interface Ipv4Assignment {
    date: string;
    prefix: string;
    status: string;
    organization: string;
    indResInfo: string;
    whoisQueryUrl: string;
}

interface IMyResourcesDataService {
    getIpv4Allocations(): Ipv4Allocation[];
    getIpv4Assignments(): Ipv4Assignment[];
}
