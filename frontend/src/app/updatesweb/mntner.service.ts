import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Address4 } from 'ip-address';
import { from, mergeMap, Observable, of } from 'rxjs';
import { PrefixServiceUtils } from '../domainobject/prefix.service.utils';
import { IpAddressService } from '../myresources/ip-address.service';
import { PropertiesService } from '../properties.service';
import { OverrideCredentialsService } from '../shared/override-credentials-service';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel, IMntByModel } from '../shared/whois-response-type.model';
import { IDefaultMaintainer } from '../whois-object/types';
import { ModalAuthenticationSSOPrefilledComponent } from './modal-authentication-sso-prefilled.component';
import { ModalSsoRequiredAuthenticationComponent } from './modal-sso-required-authentication.component';
import { RestService } from './rest.service';

@Injectable({ providedIn: 'root' })
export class MntnerService {
    private overrideCredentialsService = inject(OverrideCredentialsService);
    private whoisResourcesService = inject(WhoisResourcesService);
    private whoisMetaService = inject(WhoisMetaService);
    private modalService = inject(NgbModal);
    private restService = inject(RestService);
    private propertiesService = inject(PropertiesService);
    private http = inject(HttpClient);

    public enableNonAuthUpdates: boolean;

    constructor() {
        const propertiesService = this.propertiesService;

        this.enableNonAuthUpdates = propertiesService.isEnableNonAuthUpdates();
    }

    public getAuthForObjectIfNeeded(whoisObject: any, ssoAccts: any, operation: any, source: any, objectType: string, name: string): Observable<any> {
        const object = {
            name,
            source,
            type: objectType,
        };

        if (!this.isSsoAuthorisedForMntByOrLower(whoisObject, ssoAccts)) {
            const mntByAttrs = WhoisResourcesService.getAllAttributesOnName(whoisObject, 'mnt-by');
            const mntLowerAttrs = WhoisResourcesService.getAllAttributesOnName(whoisObject, 'mnt-lower');
            const parentMntners = mntByAttrs.concat(mntLowerAttrs).map((mntner: any) => {
                return { key: mntner.value };
            });

            // check if we've already got an override
            const alreadyAuthed = parentMntners.findIndex((parentMnt) => {
                return (
                    this.overrideCredentialsService.hasCredentials() &&
                    this.overrideCredentialsService.getCredentials().some((cred) => cred.mntner === parentMnt.key)
                );
            });

            if (alreadyAuthed > -1) {
                return of(true);
            }
            // pop up an auth box
            return this.restService.detailsForMntners(parentMntners).pipe(
                mergeMap((enrichedMntners: IMntByModel[]) => {
                    const mntnersForAuthentication = this.getMntnersForAuthentication(ssoAccts, enrichedMntners, []);
                    const modalRef = this.modalService.open(
                        !this.enableNonAuthUpdates ? ModalSsoRequiredAuthenticationComponent : ModalAuthenticationSSOPrefilledComponent,
                    );
                    modalRef.componentInstance.resolve = {
                        method: operation,
                        objectType: object.type,
                        objectName: object.name,
                        mntners: mntnersForAuthentication,
                        allowForcedDelete: false,
                        isLirObject: false,
                        source: object.source,
                    };
                    return from(modalRef.result);
                }),
            );
        } else {
            return of(true);
        }
    }

    public isSsoAuthorisedForMntByOrLower(object: any, maintainers: IMntByModel[]) {
        const mntBys = WhoisResourcesService.getAllAttributesOnName(object, 'mnt-by');
        const mntLowers = WhoisResourcesService.getAllAttributesOnName(object, 'mnt-lower');
        const ssoAccts = maintainers.filter((mntner: IMntByModel) => {
            return mntner.auth.find((auth) => {
                return auth === 'SSO';
            });
        });
        const match = mntBys.concat(mntLowers).find((item: any) => {
            return ssoAccts.find((ssoAcct: IMntByModel) => {
                return ssoAcct.key.toUpperCase() === item.value.toUpperCase();
            });
        });
        return !!match;
    }

    public isRemovable(mntnerKey: string) {
        return !this.isNccMntner(mntnerKey);
    }

    public isNccMntner(mntnerKey: string): boolean {
        return this.propertiesService.isNccMntner(mntnerKey);
    }

    public isAnyNccMntner(mntnerKey: string): boolean {
        return this.propertiesService.isAnyNccMntner(mntnerKey);
    }

    public isMntnerOnlist(list: IMntByModel[], mntner: IMntByModel): boolean {
        return list.some((item: IMntByModel) => {
            return item.key.toUpperCase() === mntner.key.toUpperCase();
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
        if (mntner.auth === undefined) {
            return false;
        }
        return mntner.auth.some((i: string) => {
            return i.startsWith('SSO');
        });
    }

    public hasPgp(mntner: IMntByModel): boolean {
        if (mntner.auth === undefined) {
            return false;
        }
        return mntner.auth.some((i: string) => {
            return i.startsWith('PGP');
        });
    }

    public isNew(mntner: any): boolean {
        if (mntner.isNew === undefined) {
            return false;
        }
        return mntner.isNew;
    }

    public enrichWithSsoStatus(ssoMntners: IMntByModel[], mntners: IMntByModel[]): IMntByModel[] {
        return mntners.map((mntner: IMntByModel) => {
            mntner.mine = this.isMntnerOnlist(ssoMntners, mntner);
            return mntner;
        });
    }

    public enrichWithNewStatus(originalMntners: IMntByModel[], actualMntners: IMntByModel[]): IMntByModel[] {
        return actualMntners.map((mntner: IMntByModel) => {
            mntner.isNew = !this.isMntnerOnlist(originalMntners, mntner);
            return mntner;
        });
    }

    public stripNccMntners(mntners: IMntByModel[]): IMntByModel[] {
        return this.enableNonAuthUpdates
            ? mntners
            : mntners.filter((mntner: IMntByModel) => {
                  return !this.isAnyNccMntner(mntner.key);
              });
    }

    public filterAutocompleteMntners(listedMntners: IMntByModel[], mntners: IMntByModel[]) {
        return mntners.filter((mntner) => {
            return (!this.isAnyNccMntner(mntner.key) || this.enableNonAuthUpdates) && !this.isMntnerOnlist(listedMntners, mntner);
        });
    }

    public enrichWithMine = (ssoMntners: IMntByModel[], mntners: IMntByModel[]) => this.enrichWithSsoStatus(ssoMntners, mntners);

    public needsAuthentication(ssoMntners: IMntByModel[], originalObjectMntners: IMntByModel[], objectMntners: IMntByModel[]): boolean {
        if (originalObjectMntners.length === 0) {
            // it is a creat
            originalObjectMntners = objectMntners.filter((mnt: IMntByModel) => !this.isMntnerOnlist(ssoMntners, mnt));
            // filter out sso maintainers from objectMaintainers, so we can made check just on originalMainatiners
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, originalObjectMntners);

        if (mntners.length === 0) {
            return false;
        }

        if (MntnerService.oneOfOriginalMntnersIsMine(originalObjectMntners)) {
            return false;
        }

        if (this.oneOfOriginalMntnersHasCredential(originalObjectMntners)) {
            return false;
        }
        return true;
    }

    public getMntnersForAuthentication(ssoMntners: IMntByModel[], originalObjectMntners: IMntByModel[], objectMntners: IMntByModel[]) {
        let input = originalObjectMntners;
        if (originalObjectMntners.length === 0) {
            // it is a creat
            input = objectMntners;
        }
        const mntners = this.enrichWithSsoStatus(ssoMntners, input);
        const seen = new Set();
        return (mntners ?? []).filter((mntner) => {
            if (seen.has(mntner.key)) return false;
            seen.add(mntner.key);

            return !mntner.mine && this.enableNonAuthUpdates;
        });
    }

    public mntbyDescription(objectType: string) {
        return this.whoisMetaService.getAttributeDescription(objectType, 'mnt-by');
    }

    public mntbySyntax(objectType: string): any {
        return this.whoisMetaService.getAttributeSyntax(objectType, 'mnt-by');
    }

    public removeDuplicatedMnts(mntners: IMntByModel[]): IMntByModel[] {
        const mntNames = new Set<string>();
        return mntners.reduce((acc: IMntByModel[], curr: IMntByModel) => {
            if (!mntNames.has(curr.key)) {
                acc.push(curr);
                mntNames.add(curr.key);
            }
            return acc;
        }, []);
    }

    public removeDuplicateMntsFromAttribute(attributes): IAttributeModel[] {
        const acc = new Set<string>();
        return attributes.filter((attr) => {
            if (attr.name === 'mnt-by') {
                if (acc.has(attr.value)) {
                    return false;
                }
                acc.add(attr.value);
            }
            return true;
        });
    }

    public getMntsToAuthenticateUsingParent(prefix: any, mntHandler: any) {
        prefix = IpAddressService.rangeToSlash(prefix);
        const address = IpAddressService.getCidrAddress(prefix);
        const objectType = address instanceof Address4 ? 'inetnum' : 'inet6num';
        this.restService.fetchResource(objectType, prefix).subscribe({
            next: (result: any) => {
                if (result && result.objects && Array.isArray(result.objects.object)) {
                    const wrappedResource = this.whoisResourcesService.validateWhoisResources(result);

                    // Find exact or most specific matching inet(num), and collect the following mntners:
                    // (1) mnt-domains
                    const resourceAttributes = this.whoisResourcesService.getAttributes(wrappedResource);

                    const mntDomains = WhoisResourcesService.getAllAttributesOnName(resourceAttributes, 'mnt-domains');
                    if (mntDomains.length > 0) {
                        return mntHandler(mntDomains);
                    }

                    // (2) if NOT exact match, then check for mnt-lower
                    const primaryKey = this.whoisResourcesService.getPrimaryKey(wrappedResource);

                    if (!(PrefixServiceUtils.isExactMatch(address, primaryKey) && PrefixServiceUtils.isSizeOfDomainBlock(address))) {
                        const mntLowers = WhoisResourcesService.getAllAttributesOnName(resourceAttributes, 'mnt-lower');
                        if (mntLowers.length > 0) {
                            return mntHandler(mntLowers);
                        }
                    }

                    // (3) mnt-by
                    const mntBys = WhoisResourcesService.getAllAttributesOnName(resourceAttributes, 'mnt-by');
                    return mntHandler(mntBys);
                }
            },
            error: () => {
                return mntHandler([]);
            },
        });
    }

    getDefaultMaintainers(orgId: string): Observable<IDefaultMaintainer> {
        return this.http.get<IDefaultMaintainer>(`api/whois-internal/public/lir/${orgId}/mntner`);
    }

    private static oneOfOriginalMntnersIsMine(originalObjectMntners: IMntByModel[]) {
        return originalObjectMntners.some((mntner: IMntByModel) => {
            return mntner.mine === true;
        });
    }

    private oneOfOriginalMntnersHasCredential(originalObjectMntners: IMntByModel[]) {
        if (this.overrideCredentialsService.hasCredentials()) {
            const credentialsUpperCase = this.overrideCredentialsService.getCredentials().map((cred) => cred.mntner.toUpperCase());
            return originalObjectMntners.some((mntner: IMntByModel) => credentialsUpperCase.includes(mntner.key.toUpperCase()));
        }
        return false;
    }
}
