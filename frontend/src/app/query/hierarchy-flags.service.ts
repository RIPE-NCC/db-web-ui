import { Injectable } from '@angular/core';

export interface IHierarchyFlag {
    id: number;
    short: string;
    long: string;
    description: string;
}

@Injectable()
export class HierarchyFlagsService {
    static readonly hierarchyFlagMap: IHierarchyFlag[] = [
        { id: 0, short: 'No', long: '', description: 'No hierarchy flag (default).' },
        {
            id: 1,
            short: 'l',
            long: 'one-less',
            description: 'Returns first level less specific inetnum, inet6num or route(6) objects, excluding exact matches.',
        },
        { id: 2, short: 'L', long: 'all-less', description: 'Returns all level less specific inetnum, inet6num or route(6) objects, including exact matches.' },
        {
            id: 3,
            short: 'm',
            long: 'one-more',
            description: 'Returns first level more specific inetnum, inet6num or route(6) objects, excluding exact matches.',
        },
        { id: 4, short: 'M', long: 'all-more', description: 'Returns all level more specific inetnum, inet6num or route(6) objects, excluding exact matches.' },
        {
            id: 5,
            short: 'x',
            long: 'exact',
            description: 'Requests that only an exact match on a prefix be performed. If no exact match is found no objects are returned.',
        },
    ];

    public static shortHierarchyFlagToLong(flag: string) {
        return this.hierarchyFlagMap.find((hierarchyFlag) => hierarchyFlag.short === flag)?.long;
    }

    public static longHierarchyFlagToShort(flag: string) {
        return this.hierarchyFlagMap.find((hierarchyFlag) => hierarchyFlag.long === flag)?.short;
    }

    public static idHierarchyFlagFromShort(flag: string) {
        return this.hierarchyFlagMap.find((hierarchyFlag) => hierarchyFlag.short === flag)?.id;
    }
}
