interface NvPair {
    name: string;
    value: string;
}

interface StrNvPair {
    str: NvPair;
}

interface IntNvPair {
    int: NvPair;
}

interface ArrNvPair {
    name: string;
    arr: {
        name: string;
        str: NvPair;
    };
}
interface DocNvPair {
    doc: {
        strs: StrNvPair[];
    }
}
interface LstObj {
    lst: {
        name: string;
        arrs: ArrNvPair[];
        ints: IntNvPair[];
        strs: StrNvPair[];
        lsts: LstObj[];
    }
}

interface ISearchResponseModel {
    result: {
        name: string;
        start: number;
        numFound: number;
        docs: DocNvPair[];
    };
    lsts: LstObj[];
}

interface ResultSummary {
    name: string;
    value: number;
}
