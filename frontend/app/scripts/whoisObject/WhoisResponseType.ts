interface IErrorMessageModel {
    attribute?: IAttributeModel;
    severity: string;
    text: string;
    args?: [{
        value: string;
    }];
}

interface IWhoisLinkModel {
    type: string;
    href: string;
}

interface IAttributeModel {
    name: string;
    value: string | any;
    link?: IWhoisLinkModel;
    "referenced-type"?: string;
    $$error?: string;
    $$info?: string;
    $$invalid?: boolean;
    $$id?: string;
    comment?: string;
    $$success?: string;
    $$statusOptionList?: IStatusOption[];
    $$meta?: {
        $$idx?: string,
        $$mandatory?: boolean,
        $$multiple?: boolean,
        $$primaryKey?: boolean,
        $$refs?: string[],
        $$isEnum?: boolean,
        $$isLir?: boolean,
        $$disable?: boolean,
    };
}

interface IStatusOption {
    key: string;
    value: string;
}

interface IWhoisObjectModel {
    type: string;
    link: IWhoisLinkModel;
    source: {
        id: string;
    };
    "primary-key": {
        attribute: IAttributeModel[];
    };
    attributes: {
        attribute: IAttributeModel[];
    };
    managed?: boolean;
}

interface IWhoisResponseModel {
    link?: IWhoisLinkModel;
    errormessages: {
        errormessage: IErrorMessageModel[],
    };
    service?: {
        name: string,
    };
    parameters?: {
        "inverse-lookup": {},
        "type-filters": {},
        flags: {},
        "query-strings": {
            "query-string": [{
                value: string;
            }],
        },
        sources: {},
    };
    objects?: {
        object: IWhoisObjectModel[];
    };
    "terms-and-conditions"?: any;
}

interface IMntByModel {
    auth?: string[];
    key: string;
    mine: boolean;
    type: string;
}
