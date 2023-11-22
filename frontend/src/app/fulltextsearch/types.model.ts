interface INvPair {
    name: string;
    value: string;
}

interface IStrNvPair {
    str: INvPair;
}

interface IIntNvPair {
    int: INvPair;
}

interface IArrNvPair {
    name: string;
    arr: {
        name: string;
        str: INvPair;
    };
}
interface IDocNvPair {
    doc: {
        strs: IStrNvPair[];
    };
}
export interface ILstObj {
    lst: {
        name: string;
        arrs: IArrNvPair[];
        ints: IIntNvPair[];
        strs: IStrNvPair[];
        lsts: ILstObj[];
    };
}

export interface ISearchResponseModel {
    result: {
        name: string;
        start: number;
        numFound: number;
        docs: IDocNvPair[];
    };
    lsts: ILstObj[];
}

export interface IResultSummary {
    name: string;
    value: number;
}
