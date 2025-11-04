import { Location } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { IAttributeModel } from '../shared/whois-response-type.model';

@Injectable({ providedIn: 'root' })
export class ErrorReporterService {
    private location = inject(Location);

    public log(operation: string, objectType: string, globalErrors: any, attributes?: IAttributeModel[]) {
        _.each(globalErrors, (item: any) => {
            console.error('url:' + this.location.path() + ', operation:' + operation + ', objectType: ' + objectType + ', description: ' + item.plainText);
        });
        _.each(attributes, (item: any) => {
            if (!_.isUndefined(item.$$error)) {
                console.error(
                    'url:' +
                        this.location.path() +
                        ', operation:' +
                        operation +
                        ', objectType: ' +
                        objectType +
                        ', attributeType: ' +
                        item.name +
                        ', description: ' +
                        item.$$error,
                );
            }
        });
    }
}
