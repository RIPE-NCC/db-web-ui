export interface IDefaultMaintainer {
    objects: {
        object: IWhoisObject[];
    };
}

export interface IWhoisObject {
    type: string;
    link: {
        type: string;
        href: string;
    };
    source: {
        id: string;
    };
    'primary-key': {
        attribute: IAttributeModel[];
    };
    attributes: {
        attribute: IAttributeModel[];
    };
}

export interface IAttributeModel {
    name: string;
    value: string;
}
