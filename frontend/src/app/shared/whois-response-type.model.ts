export interface IErrorMessageModel {
    attribute?: IAttributeModel;
    severity?: string;
    text?: string;
    args?: IErrorMessageArgValueModel[];
    plainText?: string;
}

interface IErrorMessageArgValueModel {
    value: string;
}

export interface IWhoisLinkModel {
    type: string;
    href: string;
}

export interface IAttributeModel {
    name: string;
    value?: string | any;
    link?: IWhoisLinkModel;
    'referenced-type'?: string;
    $$error?: string;
    $$info?: string;
    $$invalid?: boolean;
    $$id?: string;
    comment?: string;
    $$success?: string;
    $$statusOptionList?: IStatusOption[];
    $$hidden?: boolean;
    $$disable?: boolean;
    $$hashKey?: string;
    $$meta?: {
        $$idx?: number;
        $$mandatory?: boolean;
        $$multiple?: boolean;
        $$primaryKey?: boolean;
        $$refs?: string[];
        $$searchable?: boolean;
        $$isEnum?: boolean;
        $$isLir?: boolean;
        $$disable?: boolean;
        $$short?: string;
    };
}

export interface IStatusOption {
    key: string;
    value: string;
}

export interface IWhoisObjectModel {
    type?: string;
    link?: IWhoisLinkModel;
    source: {
        id: string;
    };
    'primary-key'?: {
        attribute: IAttributeModel[];
    };
    attributes: {
        attribute: IAttributeModel[];
    };
    'resource-holder'?: {
        key: string;
        name: string;
    };
    'abuse-contact'?: IAbuseCModel;
    managed?: boolean;
    version?: IVersion;
}

interface IAbuseCModel {
    key: string;
    email: string;
    suspect?: boolean;
    'org-id'?: string;
}

export interface IVersion {
    version: string;
    timestamp: string;
}

export interface IWhoisResponseModel {
    link?: IWhoisLinkModel;
    errormessages?: {
        errormessage: IErrorMessageModel[];
    };
    service?: {
        name: string;
    };
    parameters?: {
        'inverse-lookup': {};
        'type-filters': {};
        flags: {};
        'query-strings': {
            'query-string': [
                {
                    value: string;
                },
            ];
        };
        sources: {};
    };
    objects?: {
        object: IWhoisObjectModel[];
    };
    'terms-and-conditions'?: any;
    version?: IVersion;
}

export interface IMntByModel {
    auth?: string[];
    key: string;
    mine?: boolean;
    type: string;
    isNew?: boolean;
}
