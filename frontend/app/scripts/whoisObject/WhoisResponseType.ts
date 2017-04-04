interface IErrorMessageModel {
    severity: string;
    text: string;
    args: [{
        value: string;
    }];
}

interface IWhoisLinkModel {
    type: string;
    href: string;
}

interface IAttributeModel {
    name: string;
    value: string;
    link?: IWhoisLinkModel;
    "referenced-type": string;
}

interface IWhoisObjectModel {
    name: string;
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
    "terms-and-conditions": any;
}
