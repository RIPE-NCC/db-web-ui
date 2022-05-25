import { IWhoisObjectModel } from '../shared/whois-response-type.model';
import { IMoreSpecificResource } from './morespecifics/more-specifics.service';

export interface IResourceModel {
    resource: string;
    type: string;
}

export interface IResourceRangeModel {
    string: string;
    slash: string;
    start?: number;
    end?: number;
}

export interface IIPv4ResourceDetails {
    range: IResourceRangeModel;
    status: string;
    netname: string;
    usage: IUsage;
}

export interface IIPv6ResourceDetails {
    range: IResourceRangeModel;
    status: string;
    usage: IUsage;
}

export interface IAsnResourceDetails {
    value: number;
}

export interface IIPv6ResourcesResponse {
    orgid: string;
    resources: IIPv6ResourceDetails[];
}

export interface IIPv4ResourcesResponse {
    orgid: string;
    resources: IIPv4ResourceDetails[];
}

// from backend
export interface IUsage {
    total: number;
    used: number;
    blockSize: number;
    free?: number; // calculated in f/e
}

export interface IResourceTickets {
    tickets: {
        [resourceName: string]: ITicket[];
    };
}

interface ITicket {
    number: string;
    date: string;
    resource: string;
}

export interface IResourceOverviewResponseModel {
    filteredSize: number;
    stats: any;
    resources: any[];
}

export interface IResourceScreenItem {
    netname?: string;
    asname?: string;
    orgName?: string;
    resource: string;
    status: string;
    type: string;
    usage: IUsage;
    noContract: boolean;
    sponsoredByOther: boolean;
    sponsored: boolean;
    ipanalyserRedirect: boolean;
    iRR?: boolean; // any related route(6)
    rDNS?: boolean; // any related domain object's
}

export interface IResourceDetailsResponseModel {
    resources: IMoreSpecificResource[];
    totalNumberOfResources: number;
    filteredSize: number;
    object?: IWhoisObjectModel;
    notUnderContract?: boolean;
    sponsoredByOther?: boolean;
    sponsored?: boolean;
    iRR?: boolean; // any related route(6)
    rDNS?: boolean; // any related domain object's
}

export interface IIpv4Analysis {
    allocations: IIpv4AllocationAnalysis[];
}

export interface IIpv4AllocationAnalysis {
    violations: IIpv4ViolationsAnalysis;
}

interface IIpv4ViolationsAnalysis {
    inetnumSyntaxErrors: string[];
    overlappingInetnums: IIpv4OverlappingInetnumsAnalysis[];
}

export interface IIpv4OverlappingInetnumsAnalysis {
    range: string;
}
