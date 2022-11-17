import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { RestService } from './rest.service';

@Injectable()
export class OrganisationHelperService {
    constructor(private whoisResourcesService: WhoisResourcesService, private restService: RestService) {}

    public validateAbuseC(objectType: string, attributes: IAttributeModel[]): boolean {
        if (objectType === 'organisation') {
            if (this.containsAbuseC(attributes)) {
                return true;
            } else {
                const abuseC = _.find(attributes, (attr: IAttributeModel) => {
                    return attr.name === 'abuse-c';
                });

                if (abuseC) {
                    abuseC.$$error = 'Please provide an Abuse-c or remove the attribute if you would like to do it later';
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return true;
        }
    }

    public containsAbuseC(attributes: IAttributeModel[]): boolean {
        const abuseC = _.find(attributes, (attr: IAttributeModel) => {
            return attr.name === 'abuse-c';
        });

        if (abuseC) {
            return !_.isEmpty(_.trim(abuseC.value));
        } else {
            return false;
        }
    }

    public addAbuseC(objectType: string, attributes: any): IAttributeModel[] {
        if (objectType === 'organisation') {
            attributes = this.whoisResourcesService.wrapAndEnrichAttributes(objectType, attributes);
            const email = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'e-mail');
            const attrs = this.whoisResourcesService.addAttributeAfter(attributes, { name: 'abuse-c', value: '' }, email);
            return this.whoisResourcesService.wrapAndEnrichAttributes(objectType, attrs);
        } else {
            return attributes;
        }
    }

    public updateAbuseC(source: string, objectType: string, roleForAbuseC: any, organisationAttributes: any, passwords?: any) {
        if (objectType === 'organisation' && roleForAbuseC) {
            roleForAbuseC = this.whoisResourcesService.validateAttributes(roleForAbuseC);
            _.forEach(WhoisResourcesService.getAllAttributesOnName(roleForAbuseC, 'mnt-by'), (mnt) => {
                roleForAbuseC = this.whoisResourcesService.removeAttribute(roleForAbuseC, mnt);
                roleForAbuseC = this.whoisResourcesService.validateAttributes(roleForAbuseC); // I really don't know when to use the wrappers! ;(
            });

            roleForAbuseC = this.whoisResourcesService.validateAttributes(roleForAbuseC);
            _.forEach(WhoisResourcesService.getAllAttributesOnName(organisationAttributes, 'mnt-by'), (mnt) => {
                roleForAbuseC = this.whoisResourcesService.addAttributeAfterType(roleForAbuseC, { name: 'mnt-by', value: mnt.value }, { name: 'nic-hdl' });
                roleForAbuseC = this.whoisResourcesService.validateAttributes(roleForAbuseC);
            });

            roleForAbuseC = this.whoisResourcesService.setSingleAttributeOnName(
                roleForAbuseC,
                'address',
                this.whoisResourcesService.getSingleAttributeOnName(organisationAttributes, 'address').value,
            );

            this.restService
                .modifyObject(
                    source,
                    'role',
                    this.whoisResourcesService.getSingleAttributeOnName(roleForAbuseC, 'nic-hdl').value,
                    this.whoisResourcesService.turnAttrsIntoWhoisObject(roleForAbuseC),
                    passwords,
                )
                .subscribe({
                    next: () => {
                        // Object successfully modified
                    },
                    error: () => {
                        // Error trying to modify object
                    },
                });
        }
    }
}
