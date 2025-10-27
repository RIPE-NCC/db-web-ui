import { Injectable, inject } from '@angular/core';
import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { RestService } from './rest.service';

@Injectable()
export class OrganisationHelperService {
    private whoisResourcesService = inject(WhoisResourcesService);
    private restService = inject(RestService);

    public validateOrganisationAttributes(objectType: string, attributes: IAttributeModel[]): boolean {
        if (objectType === 'organisation') {
            const countryValidated = this.validateCountry(attributes);
            const abuseCValidated = this.validateAbuseC(attributes);
            return countryValidated && abuseCValidated;
        } else {
            return true;
        }
    }

    public validateCountry(attributes: IAttributeModel[]): boolean {
        const country = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'country');

        if (country && isEmpty(trim(country.value))) {
            country.$$error = 'Please provide a valid country code or remove the attribute if you would like to do it later';
            return false;
        }
        return true;
    }

    public validateAbuseC(attributes: IAttributeModel[]): boolean {
        if (!this.containsAttribute(attributes, 'abuse-c')) {
            const abuseC = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'abuse-c');
            if (abuseC) {
                abuseC.$$error = 'Please provide an Abuse-c or remove the attribute if you would like to do it later';
                return false;
            }
        }
        return true;
    }

    public containsAttribute(attributes: IAttributeModel[], attributeName: string): boolean {
        const attribute = this.whoisResourcesService.getSingleAttributeOnName(attributes, attributeName);
        return attribute ? !isEmpty(trim(attribute.value)) : false;
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
            WhoisResourcesService.getAllAttributesOnName(roleForAbuseC, 'mnt-by').forEach((mnt) => {
                roleForAbuseC = this.whoisResourcesService.removeAttribute(roleForAbuseC, mnt);
                roleForAbuseC = this.whoisResourcesService.validateAttributes(roleForAbuseC); // I really don't know when to use the wrappers! ;(
            });

            roleForAbuseC = this.whoisResourcesService.validateAttributes(roleForAbuseC);
            WhoisResourcesService.getAllAttributesOnName(organisationAttributes, 'mnt-by').forEach((mnt) => {
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
