import { EventEmitter, Injectable } from '@angular/core';
import { IAttributeModel } from '../shared/whois-response-type.model';

@Injectable()
export class AttributeSharedService {
    public attributeStateChanged$: EventEmitter<IAttributeModel>;
    public domainPrefixOk$: EventEmitter<string>;

    private attribute: IAttributeModel;
    private domainPrefix: string;

    constructor() {
        this.attributeStateChanged$ = new EventEmitter();
        this.domainPrefixOk$ = new EventEmitter();
    }

    public stateChanged(attr: any): void {
        this.attribute = attr;
        this.attributeStateChanged$.emit(attr);
    }

    public prefixOk(domainPrefix: string): void {
        this.domainPrefix = domainPrefix;
        this.domainPrefixOk$.emit(domainPrefix);
    }
}
