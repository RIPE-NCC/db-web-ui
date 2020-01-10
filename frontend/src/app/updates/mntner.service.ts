import {Injectable} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import {CredentialsService} from "../shared/credentials.service";
import {RestService} from "./rest.service";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {WhoisMetaService} from "../shared/whois-meta.service";
import {IMntByModel} from "../shared/whois-response-type.model";
import {PrefixService} from "../domainobject/prefix.service";
import {ModalAuthenticationComponent} from "./web/modal-authentication.component";

@Injectable()
export class MntnerService {

    private readonly nccEndMntner: string;
    private readonly nccHmMntner: string;
    private readonly nccHmPiMntner: string;
    private readonly nccLegacyMntner: string;
    private readonly nccRpslMntner: string;
    private readonly nccMntners: string[];

    constructor(private credentialsService: CredentialsService,
                private whoisResourcesService: WhoisResourcesService,
                private whoisMetaService: WhoisMetaService,
                private modalService: NgbModal,
                private restService: RestService,
                private prefixService: PrefixService) {
        this.nccEndMntner = "RIPE-NCC-END-MNT";
        this.nccHmMntner = "RIPE-NCC-HM-MNT";
        this.nccHmPiMntner = "RIPE-NCC-HM-PI-MNT";
        this.nccLegacyMntner = "RIPE-NCC-LEGACY-MNT";
        this.nccRpslMntner = "RIPE-NCC-RPSL-MNT";
        this.nccMntners = [this.nccHmMntner, this.nccEndMntner, this.nccLegacyMntner];
    }

    public getAuthForObjectIfNeeded(whoisObject: any, ssoAccts: any, operation: any, source: any, objectType: string, name: string): Promise<any> {

        const object = {
            name,
            source,
            type: objectType,
        };

        return new Promise((resolve: any, reject: any) => {
            if (!this.isSsoAuthorisedForMntByOrLower(whoisObject, ssoAccts)) {
                const mntByAttrs = this.whoisResourcesService.getAllAttributesOnName(whoisObject, "mnt-by");
                const mntLowerAttrs = this.whoisResourcesService.getAllAttributesOnName(whoisObject, "mnt-lower");
                const parentMntners = _.map(mntByAttrs.concat(mntLowerAttrs), (mntner: any) => {
                    return {key: mntner.value};
                });

                // check if we've already got a passwd
                const alreadyAuthed = _.findIndex(parentMntners, (parentMnt) => {
                    return this.credentialsService.getCredentials() && this.credentialsService.getCredentials().mntner === parentMnt.key;
                });
                if (alreadyAuthed > -1) {
                    return resolve();
                }
                // pop up an auth box
                this.restService.detailsForMntners(parentMntners)
                    .then((enrichedMntners: IMntByModel[]) => {
                        const mntnersWithPasswords = this.getMntnersForPasswordAuthentication(ssoAccts, enrichedMntners, []);
                        const mntnersWithoutPasswords = this.getMntnersNotEligibleForPasswordAuthentication(ssoAccts, enrichedMntners, []);
                        const modalRef = this.modalService.open(ModalAuthenticationComponent);
                        modalRef.componentInstance.resolve = {
                            method: operation,
                            objectType: object.type,
                            objectName: object.name,
                            mntners: mntnersWithPasswords,
                            mntnersWithoutPassword: mntnersWithoutPasswords,
                            allowForcedDelete: false,
                            isLirObject: false,
                            source: object.source
                        };
                        return modalRef.result
                            .then(resolve, reject);
                }, reject);
            } else {
                resolve();
            }
        });
    }

    public isSsoAuthorisedForMntByOrLower(object: any, maintainers: IMntByModel[]) {
        const mntBys = this.whoisResourcesService.getAllAttributesOnName(object, "mnt-by");
        const mntLowers = this.whoisResourcesService.getAllAttributesOnName(object, "mnt-lower");
        const ssoAccts = _.filter(maintainers, (mntner: IMntByModel) => {
            return _.find(mntner.auth, (auth) => {
                return auth === "SSO";
            });
        });
        const match = _.find(mntBys.concat(mntLowers), (item: any) => {
            return _.find(ssoAccts, (ssoAcct: IMntByModel) => {
                return ssoAcct.key.toUpperCase() === item.value.toUpperCase();
            });
        });
        return !!match;
    }

    public isRemovable(mntnerKey: string) {
        // Should be possible to remove RIPE-NCC-RPSL-MNT, but allowed to add it
        if (mntnerKey.toUpperCase() === this.nccRpslMntner) {
            return true;
        }
        return !_.includes(this.nccMntners, mntnerKey.toUpperCase());
    }

    public isNccMntner(mntnerKey: string): boolean {
        return _.includes(this.nccMntners, mntnerKey.toUpperCase());
    }

    public isComaintained(attributes: any) {
        return _.some(attributes, (attr: any) => {
            if (attr.name.toUpperCase() === "MNT-BY") {
                return this.isNccMntner(attr.value);
            } else {
                return false;
            }
        });
    }

    public isComaintainedWithNccHmMntner(attributes: any) {
        return _.some(attributes, (attr: any) => {
            if (attr.name.toUpperCase() === "MNT-BY") {
                return this.isNccHmMntner(attr.value) || this.isNccHmPiMntner(attr.value);
            } else {
                return false;
            }
        });
    }

    public isNccEndUserMntner(mntnerKey: string): boolean {
        return this.nccEndMntner === mntnerKey.toUpperCase();
    }

    public isNccHmMntner(mntnerKey: string): boolean {
        return this.nccHmMntner === mntnerKey.toUpperCase();
    }

    public isNccHmPiMntner(mntnerKey: string): boolean {
        return this.nccHmMntner === mntnerKey.toUpperCase();
    }

    public isNccRpslMntner(mntnerKey: string): boolean {
        return this.nccRpslMntner === mntnerKey.toUpperCase();
    }

    public isMntnerOnlist(list: IMntByModel[], mntner: IMntByModel): boolean {
        return _.some(list, (item: IMntByModel) => {
            return item.key.toUpperCase() === mntner.key.toUpperCase();
        });
    }

    public hasNccMntner(mntnerList: IMntByModel[]): boolean {
        return _.some(mntnerList, (mntner: string) => {
            return this.isNccMntner(mntner);
        });
    }

    public hasMd5(mntner: IMntByModel): boolean {
        if (_.isUndefined(mntner.auth)) {
            return false;
        }

        return _.some(mntner.auth, (i: string) => {
            return _.startsWith(i, "MD5");
        });
    }

    public isMine(mntner: IMntByModel): boolean {
        if (!mntner.mine) {
            return false;
        } else {
            return mntner.mine;
        }
    }

    public hasSSo(mntner: IMntByModel): boolean {
        if (_.isUndefined(mntner.auth)) {
            return false;
        }
        return _.some(mntner.auth, (i: string) => {
            return _.startsWith(i, "SSO");
        });
    }

    public hasPgp(mntner: IMntByModel): boolean {
        if (_.isUndefined(mntner.auth)) {
            return false;
        }
        return _.some(mntner.auth, (i: string) => {
            return _.startsWith(i, "PGP");
        });
    }

    public isNew(mntner: any): boolean {
        if (_.isUndefined(mntner.isNew)) {
            return false;
        }
        return mntner.isNew;
    }

    public enrichWithSsoStatus(ssoMntners: IMntByModel[], mntners: IMntByModel[]): IMntByModel[] {
        return _.map(mntners, (mntner: IMntByModel) => {
            mntner.mine = !!this.isMntnerOnlist(ssoMntners, mntner);
            return mntner;
        });
    }

    public enrichWithNewStatus(originalMntners: IMntByModel[], actualMntners: IMntByModel[]): IMntByModel[] {
        return _.map(actualMntners, (mntner: IMntByModel) => {
            mntner.isNew = !this.isMntnerOnlist(originalMntners, mntner);
            return mntner;
        });
    }

    public enrichWithMine = (ssoMntners: IMntByModel[], mntners: IMntByModel[]) => this.enrichWithSsoStatus(ssoMntners, mntners);

    public needsPasswordAuthentication(ssoMntners: IMntByModel[], originalObjectMntners: IMntByModel[], objectMntners: IMntByModel[]): boolean {
        let input = originalObjectMntners;
        if (originalObjectMntners.length === 0) {
            // it is a create
            input = objectMntners;
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, input);

        if (mntners.length === 0) {
            console.debug("needsPasswordAuthentication: no: No mntners left to authenticate against");
            return false;
        }

        // do not need password if RIPE-NCC-RPSL-MNT is present
        if (_.some(mntners, {key: this.nccRpslMntner})) {
            console.debug("needsPasswordAuthentication: no: RIPE-NCC-RPSL-MNT is present and does not require authentication");
            return false;
        }

        if (this.oneOfOriginalMntnersIsMine(mntners)) {
            console.debug("needsPasswordAuthentication: no: One of selected mntners is mine");
            return false;
        }

        if (this.oneOfOriginalMntnersHasCredential(mntners)) {
            console.debug("needsPasswordAuthentication: no: One of selected mntners has credentials");
            return false;
        }
        console.debug("needsPasswordAuthentication: yes");
        return true;
    }

    public getMntnersForPasswordAuthentication(ssoMntners: IMntByModel[], originalObjectMntners: IMntByModel[], objectMntners: IMntByModel[]) {
        let input = originalObjectMntners;
        if (originalObjectMntners.length === 0) {
            // it is a create
            input = objectMntners;
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, input);
        return _.filter(_.uniqBy(mntners, "key"), (mntner)  => {
            if (mntner.mine === true) {
                return false;
            } else if (this.isNccMntner(mntner.key) || this.isNccRpslMntner(mntner.key)) {
                // prevent authenticating against RIPE-NCC mntner
                return false;
            } else if (this.credentialsService.hasCredentials() && this.credentialsService.getCredentials().mntner === mntner.key) {
                return false;
            } else {
                return this.hasMd5(mntner);
            }
        });
    }

    public getMntnersNotEligibleForPasswordAuthentication(ssoMntners: IMntByModel[], originalObjectMntners: IMntByModel[], objectMntners: IMntByModel[]) {
        // Note: this function is NOT the exact opposite of getMntnersForPasswordAuthentication()
        let input = originalObjectMntners;
        if (originalObjectMntners.length === 0) {
            // it is a create
            input = objectMntners;
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, input);
        return _.filter(_.uniqBy(mntners, "key"), (mntner) => {

            if (mntner.mine === true) {
                return false;
            } else if (this.isNccMntner(mntner.key)) {
                // prevent customers contacting us about RIPE-NCC mntners
                return false;
            } else {
                return !this.hasMd5(mntner);
            }
        });
    }

    public mntbyDescription(objectType: string) {
        return this.whoisMetaService.getAttributeDescription(objectType, "mnt-by");
    }

    public mntbySyntax(objectType: string): any {
        return this.whoisMetaService.getAttributeSyntax(objectType, "mnt-by");
    }

    public stripNccMntners(mntners: IMntByModel[], allowEmptyResult: boolean) {
        // remove NCC mntners and dupes
        const stripped = _.reject(mntners, (mntner: IMntByModel) => {
            return (this.isNccMntner(mntner.key));
        });
        // if we are left with no mntners, return mntners array untouched
        if (_.isEmpty(stripped) && !allowEmptyResult) {
            return mntners;
        } else {
            return stripped;
        }
    }

    // temporary function to check if only mntner is RPSL
    public isLoneRpslMntner(mntners: IMntByModel[]) {
        if (mntners.length !== 1) {
            return false;
        }
        return mntners[0].key.toUpperCase() === this.nccRpslMntner;
    }

    public getMntsToAuthenticateUsingParent(prefix: any, mntHandler: any) {
        const objectType = this.prefixService.isValidIpv4Prefix(prefix) ? "inetnum" : "inet6num";
        this.restService.fetchResource(objectType, prefix)
            .then((result: any) => {

            if (result && result.objects && _.isArray(result.objects.object)) {
                const wrappedResource = this.whoisResourcesService.validateWhoisResources(result);

                // Find exact or most specific matching inet(num), and collect the following mntners:
                //     (1) mnt-domains
                const resourceAttributes = this.whoisResourcesService.getAttributes(wrappedResource);

                const mntDomains = this.whoisResourcesService.getAllAttributesOnName(resourceAttributes, "mnt-domains");
                if (mntDomains.length > 0) {
                    return mntHandler(mntDomains);
                }

                // (2) if NOT exact match, then check for mnt-lower
                const primaryKey = this.whoisResourcesService.getPrimaryKey(wrappedResource);
                if (!this.prefixService.isExactMatch(prefix, primaryKey)) {
                    const mntLowers = this.whoisResourcesService.getAllAttributesOnName(resourceAttributes, "mnt-lower");

                    if (mntLowers.length > 0) {
                        return mntHandler(mntLowers);
                    }
                }

                // (3) mnt-by
                const mntBys = this.whoisResourcesService.getAllAttributesOnName(resourceAttributes, "mnt-by");
                return mntHandler(mntBys);
            }
        }, () => {
            // TODO: error handling
            return mntHandler([]);
        });
    }

    private oneOfOriginalMntnersIsMine(originalObjectMntners: IMntByModel[]) {
        return _.some(originalObjectMntners, (mntner: IMntByModel) => {
            return mntner.mine === true;
        });
    }

    private oneOfOriginalMntnersHasCredential(originalObjectMntners: IMntByModel[]) {
        if (this.credentialsService.hasCredentials()) {
            const trustedMtnerName = this.credentialsService.getCredentials().mntner;
            return _.some(originalObjectMntners, (mntner: IMntByModel) => {
                return mntner.key.toUpperCase() === trustedMtnerName.toUpperCase();
            });
        }
        return false;
    }
}
