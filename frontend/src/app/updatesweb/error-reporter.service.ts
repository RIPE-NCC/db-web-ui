import { Location } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { IAttributeModel } from '../shared/whois-response-type.model';

@Injectable({ providedIn: 'root' })
export class ErrorReporterService {
    private location = inject(Location);

    public log(operation: string, objectType: string, globalErrors: any, attributes?: IAttributeModel[]) {
        (globalErrors ?? []).forEach((item: any) => {
            console.error('url:' + this.location.path() + ', operation:' + operation + ', objectType: ' + objectType + ', description: ' + item.plainText);
        });
        (attributes ?? []).forEach((item: any) => {
            if (item.$$error !== undefined) {
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
