import {Injectable} from "@angular/core";
import {WhoisResourcesService} from "../../shared/whois-resources.service";
import {RestService} from "../rest.service";
import {IAttributeModel} from "../../shared/whois-response-type.model";

@Injectable()
export class OrganisationHelperService {

    constructor(private whoisResourcesService: WhoisResourcesService,
                private restService: RestService) {
    }

    public validateAbuseC(objectType: string, attributes: IAttributeModel[]): boolean {
        if (objectType === "organisation") {

            if (this.containsAbuseC(attributes)) {
                return true;
            } else {
                const abuseC = _.find(attributes, (attr: IAttributeModel) => {
                    return attr.name === "abuse-c";
                });

                if (abuseC) {
                    abuseC.$$error = "Please provide an Abuse-c or remove the attribute if you would like to do it later";
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
            return attr.name === "abuse-c";
        });

        if (abuseC) {
            return !_.isEmpty(_.trim(abuseC.value));
        } else {
            return false;
        }
    }

    public addAbuseC(objectType: string, attributes: any): IAttributeModel[] {

        if (objectType === "organisation") {
            attributes = this.whoisResourcesService.wrapAndEnrichAttributes(objectType, attributes);
            const attrs = attributes.addAttributeAfter({name: "abuse-c", value: ""}, attributes.getSingleAttributeOnName("e-mail"));
            return this.whoisResourcesService.wrapAndEnrichAttributes(objectType, attrs);
        } else {
            return attributes;
        }
    }

    public updateAbuseC(source: string, objectType: string, roleForAbuseC: any, organisationAttributes: any, passwords?: any) {
        if (objectType === "organisation" && roleForAbuseC) {

            roleForAbuseC = this.whoisResourcesService.wrapAttributes(roleForAbuseC);
            _.forEach(roleForAbuseC.getAllAttributesOnName("mnt-by"), (mnt) => {
                roleForAbuseC = roleForAbuseC.removeAttribute(mnt);
                roleForAbuseC = this.whoisResourcesService.wrapAttributes(roleForAbuseC); // I really don"t know when to use the wrappers! ;(
            });

            roleForAbuseC = this.whoisResourcesService.wrapAttributes(roleForAbuseC);
            _.forEach(organisationAttributes.getAllAttributesOnName("mnt-by"), (mnt) => {
                roleForAbuseC = roleForAbuseC.addAttributeAfterType({name: "mnt-by", value: mnt.value}, {name: "nic-hdl"});
                roleForAbuseC = this.whoisResourcesService.wrapAttributes(roleForAbuseC);
            });

            roleForAbuseC.setSingleAttributeOnName("address", organisationAttributes.getSingleAttributeOnName("address").value);

            this.restService.modifyObject(source, "role", roleForAbuseC.getSingleAttributeOnName("nic-hdl").value,
                this.whoisResourcesService.turnAttrsIntoWhoisObject(roleForAbuseC), passwords)
                .subscribe(() => {}, () => {});
        }
    }
}
