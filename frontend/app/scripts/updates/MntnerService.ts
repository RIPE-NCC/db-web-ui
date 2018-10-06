class MntnerService {

    public static $inject = [
        "$log",
        "$q",
        "CredentialsService",
        "WhoisResources",
        "WhoisMetaService",
        "ModalService",
        "RestService",
        "PrefixService"];

    private readonly nccEndMntner: string;
    private readonly nccHmMntner: string;
    private readonly nccLegacyMntner: string;
    private readonly nccRpslMntner: string;
    private readonly nccMntners: string[];

    constructor(private $log: angular.ILogService,
                private $q: ng.IQService,
                private credentialsService: CredentialsService,
                private WhoisResources: any,
                private WhoisMetaService: WhoisMetaService,
                private ModalService: ModalService,
                private RestService: RestService,
                private PrefixService: PrefixService) {
        this.nccEndMntner = "RIPE-NCC-END-MNT";
        this.nccHmMntner = "RIPE-NCC-HM-MNT";
        this.nccLegacyMntner = "RIPE-NCC-LEGACY-MNT";
        this.nccRpslMntner = "RIPE-NCC-RPSL-MNT";
        this.nccMntners = [this.nccHmMntner, this.nccEndMntner, this.nccLegacyMntner];
    }

    public getAuthForObjectIfNeeded(whoisObject: any, ssoAccts: any, operation: any, source: any, objectType: string, name: string): ng.IPromise<any> {

        const object = {
            name,
            source,
            type: objectType,
        };

        const promiseHandler = (resolve: any, reject: any) => {
            if (!this.isSsoAuthorisedForMntByOrLower(whoisObject, ssoAccts)) {
                const mntByAttrs = whoisObject.getAllAttributesOnName("mnt-by");
                const mntLowerAttrs = whoisObject.getAllAttributesOnName("mnt-lower");
                const parentMntners = _.map(mntByAttrs.concat(mntLowerAttrs), (mntner: any) => {
                    return {key: mntner.value};
                });

                // check if we"ve already got a passwd
                const alreadyAuthed = _.findIndex(parentMntners, (parentMnt) => {
                    return this.credentialsService.getCredentials() && this.credentialsService.getCredentials().mntner === parentMnt.key;
                });
                if (alreadyAuthed > -1) {
                    return resolve();
                }
                // pop up an auth box
                this.RestService.detailsForMntners(parentMntners).then((enrichedMntners: IMntByModel[]) => {
                    const mntnersWithPasswords = this.getMntnersForPasswordAuthentication(ssoAccts, enrichedMntners, []);
                    const mntnersWithoutPasswords = this.getMntnersNotEligibleForPasswordAuthentication(ssoAccts, enrichedMntners, []);
                    this.ModalService.openAuthenticationModal(operation, object, mntnersWithPasswords, mntnersWithoutPasswords, false, null)
                        .then(resolve, reject);
                }, reject);
            } else {
                resolve();
            }
        };

        return this.$q(promiseHandler);
    }

    public isSsoAuthorisedForMntByOrLower(object: any, maintainers: IMntByModel[]) {
        const mntBys = object.getAllAttributesOnName("mnt-by");
        const mntLowers = object.getAllAttributesOnName("mnt-lower");
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

    public isNccEndUserMntner(mntnerKey: string): boolean {
        return this.nccEndMntner === mntnerKey.toUpperCase();
    }

    public isNccHmMntner(mntnerKey: string): boolean {
        return this.nccHmMntner === mntnerKey.toUpperCase();
    }

    public isNccRpslMntner(mntnerKey: string): boolean {
        return this.nccRpslMntner === mntnerKey.toUpperCase();
    }

    public isMntnerOnlist(list: any, mntner: IMntByModel): boolean {
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

    public enrichWithNewStatus(originalMntners: any, actualMntners: any): any {
        return _.map(actualMntners, (mntner: any) => {
            mntner.isNew = !this.isMntnerOnlist(originalMntners, mntner);
            return mntner;
        });
    }

    public enrichWithMine = (ssoMntners: IMntByModel[], mntners: IMntByModel[]) => this.enrichWithSsoStatus(ssoMntners, mntners);

    public needsPasswordAuthentication(ssoMntners: any, originalObjectMntners: any, objectMntners: any): boolean {
        let input = originalObjectMntners;
        if (originalObjectMntners.length === 0) {
            // it is a create
            input = objectMntners;
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, input);

        if (mntners.length === 0) {
            this.$log.debug("needsPasswordAuthentication: no: No mntners left to authenticate against");
            return false;
        }

        // do not need password if RIPE-NCC-RPSL-MNT is present
        if (_.some(mntners, {key: this.nccRpslMntner})) {
            this.$log.debug("needsPasswordAuthentication: no: RIPE-NCC-RPSL-MNT is present and does not require authentication");
            return false;
        }

        if (this.oneOfOriginalMntnersIsMine(mntners)) {
            this.$log.debug("needsPasswordAuthentication: no: One of selected mntners is mine");
            return false;
        }

        if (this.oneOfOriginalMntnersHasCredential(mntners)) {
            this.$log.debug("needsPasswordAuthentication: no: One of selected mntners has credentials");
            return false;
        }
        this.$log.debug("needsPasswordAuthentication: yes");
        return true;
    }

    public getMntnersForPasswordAuthentication(ssoMntners: IMntByModel[], originalObjectMntners: any, objectMntners: IMntByModel[]) {
        let input = originalObjectMntners;
        if (originalObjectMntners.length === 0) {
            // it is a create
            input = objectMntners;
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, input);
        return _.filter(_.uniq(mntners, "key"), (mntner)  => {
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

    public getMntnersNotEligibleForPasswordAuthentication(ssoMntners: any, originalObjectMntners: any, objectMntners: any) {
        // Note: this function is NOT the exact opposite of getMntnersForPasswordAuthentication()
        let input = originalObjectMntners;
        if (originalObjectMntners.length === 0) {
            // it is a create
            input = objectMntners;
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, input);
        return _.filter(_.uniq(mntners, "key"), (mntner) => {

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
        return this.WhoisMetaService.getAttributeDescription(objectType, "mnt-by");
    }

    public mntbySyntax(objectType: string): any {
        return this.WhoisMetaService.getAttributeSyntax(objectType, "mnt-by");
    }

    public stripNccMntners(mntners: any, allowEmptyResult: boolean) {
        // remove NCC mntners and dupes
        const stripped = _.reject(mntners, (mntner: any) => {
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
    public isLoneRpslMntner(mntners: any) {
        if (mntners.length !== 1) {
            return false;
        }
        return mntners[0].key.toUpperCase() === this.nccRpslMntner;
    }

    public getMntsToAuthenticateUsingParent(prefix: any, mntHandler: any) {
        const objectType = this.PrefixService.isValidIpv4Prefix(prefix) ? "inetnum" : "inet6num";
        this.RestService.fetchResource(objectType, prefix).get((result: any) => {

            if (result && result.objects && angular.isArray(result.objects.object)) {
                const wrappedResource = this.WhoisResources.wrapWhoisResources(result);

                // Find exact or most specific matching inet(num), and collect the following mntners:
                //     (1) mnt-domains
                const resourceAttributes = this.WhoisResources.wrapAttributes(wrappedResource.getAttributes());

                const mntDomains = resourceAttributes.getAllAttributesOnName("mnt-domains");
                if (mntDomains.length > 0) {
                    return mntHandler(mntDomains);
                }

                // (2) if NOT exact match, then check for mnt-lower
                const primaryKey = wrappedResource.getPrimaryKey();
                if (!this.PrefixService.isExactMatch(prefix, primaryKey)) {
                    const mntLowers = resourceAttributes.getAllAttributesOnName("mnt-lower");

                    if (mntLowers.length > 0) {
                        return mntHandler(mntLowers);
                    }
                }

                // (3) mnt-by
                const mntBys = resourceAttributes.getAllAttributesOnName("mnt-by");
                return mntHandler(mntBys);
            }

        }, () => {
            // TODO: error handling
            return mntHandler([]);
        });
    }

    private oneOfOriginalMntnersIsMine(originalObjectMntners: any) {
        return _.some(originalObjectMntners, (mntner: IMntByModel) => {
            return mntner.mine === true;
        });
    }

    private oneOfOriginalMntnersHasCredential(originalObjectMntners: any) {
        if (this.credentialsService.hasCredentials()) {
            const trustedMtnerName = this.credentialsService.getCredentials().mntner;
            return _.some(originalObjectMntners, (mntner: IMntByModel) => {
                return mntner.key.toUpperCase() === trustedMtnerName.toUpperCase();
            });
        }
        return false;
    }

}

angular.module("updates").service("MntnerService", MntnerService);
