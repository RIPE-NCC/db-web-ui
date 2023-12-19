import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { LinkService } from './link.service';
import { MessageStoreService } from './message-store.service';
import { MntnerService } from './mntner.service';
import { OrganisationHelperService } from './organisation-helper.service';

@Injectable()
export class ScreenLogicInterceptorService {
    public globalInterceptor: any;
    public objectInterceptors: any;

    constructor(
        private organisationHelperService: OrganisationHelperService,
        private messageStore: MessageStoreService,
        private mntnerService: MntnerService,
        private whoisResourcesService: WhoisResourcesService,
        private linkService: LinkService,
    ) {
        // TODO: start
        // Move the following stuff from Create-modify-controller:
        // - strip nulls
        // - RPSL password for resources
        // TODO end
        this.globalInterceptor = {
            afterEdit: (
                method: string,
                source: string,
                objectType: string,
                attributes: IAttributeModel[],
                errors: string[],
                warnings: string[],
                infos: string[],
            ) => {
                return attributes;
            },
            beforeAddAttribute: (
                method: string,
                source: string,
                objectType: string,
                objectAttributes: IAttributeModel[],
                addableAttributes: IAttributeModel[],
            ) => {
                return addableAttributes;
            },
            beforeEdit: (
                method: string,
                source: string,
                objectType: string,
                attributes: IAttributeModel[],
                errors: string[],
                warnings: string[],
                infos: string[],
            ) => {
                this.disablePrimaryKeyIfModifying(method, attributes);
                return this._loadGenericDefaultValues(method, source, objectType, attributes, errors, warnings, infos);
            },
            // Currently we have no global afterSubmitSuccess and afterSubmitError callback
        };

        this.objectInterceptors = {
            'as-block': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'as-set': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'aut-num': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: (
                    method: string,
                    source: string,
                    objectType: string,
                    attributes: IAttributeModel[],
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    this._disableStatusIfModifying(method, source, objectType, attributes, errors, warnings, infos);
                    return this._disableOrgWhenStatusIsAssignedPI(attributes);
                },
            },
            domain: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'filter-set': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'inet-rtr': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            inet6num: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: (
                    method: string,
                    source: string,
                    objectType: string,
                    objectAttributes: IAttributeModel[],
                    addableAttributes: IAttributeModel[],
                ) => {
                    return this._removeSponsoringOrgIfNeeded(method, source, objectType, objectAttributes, addableAttributes);
                },
                beforeEdit: (
                    method: string,
                    source: string,
                    objectType: string,
                    attributes: IAttributeModel[],
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    this._disableStatusIfModifying(method, source, objectType, attributes, errors, warnings, infos);
                    this._disableRipeMntnrAttributes(attributes);
                    this.disableNetnameAttribute(attributes);
                    this.disableAssignmentAttributes(attributes);
                    this.disableRipeMntIfModifying(method, attributes);
                    return this._disableOrgWhenStatusIsAssignedPI(attributes);
                },
            },
            inetnum: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: (
                    method: string,
                    source: string,
                    objectType: string,
                    objectAttributes: IAttributeModel[],
                    addableAttributes: IAttributeModel[],
                ) => {
                    return this._removeSponsoringOrgIfNeeded(method, source, objectType, objectAttributes, addableAttributes);
                },
                beforeEdit: (
                    method: string,
                    source: string,
                    objectType: string,
                    attributes: IAttributeModel[],
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    this._disableStatusIfModifying(method, source, objectType, attributes, errors, warnings, infos);
                    this._disableRipeMntnrAttributes(attributes);
                    this.disableNetnameAttribute(attributes);
                    this.disableAssignmentAttributes(attributes);
                    this.disableRipeMntIfModifying(method, attributes);
                    return this._disableOrgWhenStatusIsAssignedPI(attributes);
                },
            },
            irt: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'key-cert': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            mntner: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            organisation: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: (
                    method: string,
                    source: string,
                    objectType: string,
                    objectAttributes: IAttributeModel[],
                    addableAttributes: IAttributeModel[],
                ) => {
                    this.removeAbuseMailBoxOrgAndAddressIfLIR(method, source, objectType, objectAttributes, addableAttributes);
                    return addableAttributes;
                },
                beforeEdit: (
                    method: string,
                    source: string,
                    objectType: string,
                    attributes: IAttributeModel[],
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    this._checkLirAttributes(method, attributes);
                    this.disableRipeMntIfModifying(method, attributes);
                    return this._loadOrganisationDefaults(method, source, objectType, attributes, errors, warnings, infos);
                },
            },
            'peering-set': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            person: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: (
                    method: string,
                    source: string,
                    objectType: string,
                    attributes: IAttributeModel[],
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    return this._loadPersonRoleDefaults(method, attributes);
                },
            },
            poem: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'poetic-form': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            role: {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: (
                    method: string,
                    source: string,
                    objectType: string,
                    attributes: IAttributeModel[],
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    return this._loadPersonRoleDefaults(method, attributes);
                },
            },
            route: {
                afterEdit: undefined,
                afterSubmitError: (
                    method: string,
                    source: string,
                    objectType: string,
                    status: number,
                    whoisResources: any,
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    return this.handlePendingAuthenticationError(source, status, whoisResources);
                },
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'route-set': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            route6: {
                afterEdit: undefined,
                afterSubmitError: (
                    method: string,
                    source: string,
                    objectType: string,
                    status: number,
                    whoisResources: any,
                    errors: string[],
                    warnings: string[],
                    infos: string[],
                ) => {
                    return this.handlePendingAuthenticationError(source, status, whoisResources);
                },
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
            'rtr-set': {
                afterEdit: undefined,
                afterSubmitError: undefined,
                afterSubmitSuccess: undefined,
                beforeAddAttribute: undefined,
                beforeEdit: undefined,
            },
        };
    }

    public beforeEdit(
        method: string,
        source: string,
        objectType: string,
        attributes: IAttributeModel[],
        errors: string[] = [],
        warnings: string[] = [],
        infos: string[] = [],
    ) {
        const attrs = this.globalInterceptor.beforeEdit(method, source, objectType, attributes, errors, warnings, infos);
        const interceptorFunc = this._getInterceptorFunc(objectType, 'beforeEdit');
        if (_.isUndefined(interceptorFunc)) {
            return attrs;
        }
        return interceptorFunc(method, source, objectType, attrs, errors, warnings, infos);
    }

    public afterEdit(method: string, source: string, objectType: string, attributes: IAttributeModel[], errors: string[], warnings: string[], infos: string[]) {
        const attrs = this.globalInterceptor.beforeEdit(method, source, objectType, attributes, errors, warnings, infos);
        const interceptorFunc = this._getInterceptorFunc(objectType, 'afterEdit');
        if (_.isUndefined(interceptorFunc)) {
            return attrs;
        }
        return interceptorFunc(method, source, objectType, attrs, errors, warnings, infos);
    }

    public afterSubmitSuccess(method: string, source: string, objectType: string, responseAttributes: IAttributeModel[], warnings: string[], infos: string[]) {
        const interceptorFunc = this._getInterceptorFunc(objectType, 'afterSubmitSuccess');
        if (_.isUndefined(interceptorFunc)) {
            return false;
        }
        return interceptorFunc(method, source, objectType, responseAttributes, warnings, infos);
    }

    public afterSubmitError(
        method: string,
        source: string,
        objectType: string,
        status: string,
        whoisResources: any,
        errors: string[],
        warnings: string[],
        infos: string[],
    ) {
        const interceptorFunc = this._getInterceptorFunc(objectType, 'afterSubmitError');
        if (_.isUndefined(interceptorFunc)) {
            return false;
        }
        return interceptorFunc(method, source, objectType, status, whoisResources, errors, warnings, infos);
    }

    public beforeAddAttribute(method: string, source: string, objectType: string, objectAttributes: IAttributeModel[], addableAttributes: any) {
        const addableAttrs = this.globalInterceptor.beforeAddAttribute(method, source, objectType, objectAttributes, addableAttributes);
        const interceptorFunc = this._getInterceptorFunc(objectType, 'beforeAddAttribute');
        if (_.isUndefined(interceptorFunc)) {
            return addableAttrs;
        }
        return interceptorFunc(method, source, objectType, objectAttributes, addableAttrs);
    }

    private _loadPersonRoleDefaults(method: string, attributes: any) {
        if (method === 'Create') {
            this.whoisResourcesService.setSingleAttributeOnName(attributes, 'nic-hdl', 'AUTO-1');
        }
        return attributes;
    }

    private _checkLirAttributes(method: string, attributes: any) {
        const orgType = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'org-type');

        if (method === 'Modify' && orgType.value === 'LIR') {
            _.forEach(attributes, (attr) => {
                if (['address', 'phone', 'fax-no', 'e-mail', 'org-name', 'mnt-by', 'abuse-c'].indexOf(attr.name) > -1) {
                    attr.$$meta.$$isLir = true;
                }

                if (['address', 'phone', 'fax-no', 'e-mail', 'org-name', 'mnt-by', 'org', 'abuse-mailbox'].indexOf(attr.name) > -1) {
                    attr.$$meta.$$disable = true;
                }
            });
        }
    }

    private _loadOrganisationDefaults(
        method: string,
        source: string,
        objectType: string,
        attributes: any,
        errors: string[],
        warnings: string[],
        infos: string[],
    ) {
        if (method === 'Create') {
            if (!this.organisationHelperService.containsAbuseC(attributes)) {
                attributes = this.organisationHelperService.addAbuseC(objectType, attributes);
            }
            attributes = this.whoisResourcesService.setSingleAttributeOnName(attributes, 'organisation', 'AUTO-1');
            attributes = this.whoisResourcesService.setSingleAttributeOnName(attributes, 'org-type', 'OTHER');
        }

        if (method === 'Modify' && !this.organisationHelperService.containsAbuseC(attributes)) {
            attributes = this.organisationHelperService.addAbuseC(objectType, attributes);
            let abuseC = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'abuse-c');
            // abuseC.$$meta.$$missing = true;
            warnings.push(`<p>There is currently no abuse contact set up for your organisation, which is required under
                <a href="https://www.ripe.net/manage-ips-and-asns/resource-management/abuse-c-information" target="_blank">policy 2011-06</a>.</p>
                <p>Please specify the abuse-c attribute below.</p>`);
        }

        this.whoisResourcesService.getSingleAttributeOnName(attributes, 'org-type').$$meta.$$disable = true;
        return attributes;
    }

    private removeAbuseMailBoxOrgAndAddressIfLIR(method: string, source: string, objectType: string, objectAttributes: any, addableAttributes: any) {
        const orgType = this.whoisResourcesService.getSingleAttributeOnName(objectAttributes, 'org-type');

        this.whoisResourcesService.removeAttributeWithName(addableAttributes, 'abuse-mailbox');

        if (method === 'Modify' && orgType.value === 'LIR') {
            this.whoisResourcesService.removeAttributeWithName(addableAttributes, 'org');
            this.whoisResourcesService.removeAttributeWithName(addableAttributes, 'address');
        }

        return addableAttributes;
    }

    private disablePrimaryKeyIfModifying(method: string, attributes: IAttributeModel[]) {
        if (method === 'Modify') {
            _.forEach(attributes, (attr) => {
                if (attr.$$meta.$$primaryKey) {
                    attr.$$meta.$$disable = true;
                }
            });
        }

        return attributes;
    }

    private disableRipeMntIfModifying(method: string, attributes: any) {
        const disable = (type: string) => {
            _.forEach(WhoisResourcesService.getAllAttributesOnName(attributes, type), (attr) => {
                attr.$$meta.$$disable = this.mntnerService.isAnyNccMntner(attr.value);
            });
        };

        if (method === 'Modify') {
            disable('mnt-ref');
            disable('mnt-domains');
            disable('mnt-lower');
            disable('mnt-routes');
        }

        return attributes;
    }

    private _loadGenericDefaultValues(
        method: string,
        source: string,
        objectType: string,
        attributes: any,
        errors: string[],
        warnings: string[],
        infos: string[],
    ) {
        if (method === 'Create') {
            attributes = this.whoisResourcesService.setSingleAttributeOnName(attributes, 'source', source);
        }
        this.whoisResourcesService.getSingleAttributeOnName(attributes, 'source').$$meta.$$disable = true;
        return attributes;
    }

    // https://www.ripe.net/participate/policies/proposals/2012-08
    private _removeSponsoringOrgIfNeeded(method: string, source: string, objectType: string, objectAttributes: any, addableAttributes: any) {
        const statusAttr = this.whoisResourcesService.getSingleAttributeOnName(objectAttributes, 'status');

        if (
            statusAttr &&
            !_.isEmpty(statusAttr.value) &&
            statusAttr.value !== 'ASSIGNED PI' &&
            statusAttr.value !== 'ASSIGNED ANYCAST' &&
            statusAttr.value !== 'LEGACY'
        ) {
            this.whoisResourcesService.removeAttributeWithName(addableAttributes, 'sponsoring-org');
        }

        return addableAttributes;
    }

    private _disableStatusIfModifying(
        method: string,
        source: string,
        objectType: string,
        attributes: any,
        errors: string[],
        warnings: string[],
        infos: string[],
    ) {
        if (method === 'Modify') {
            const statusAttr = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'status');

            if (statusAttr.value !== 'NOT-SET') {
                statusAttr.$$meta.$$disable = true;
            }
        }
    }

    private _disableRipeMntnrAttributes(attributes: any) {
        // if any of the maintainers is a ripe maintainer then some attributes are read-only
        if (
            _.findIndex(WhoisResourcesService.getAllAttributesOnName(attributes, 'mnt-by'), (mntBy: any) => {
                return this.mntnerService.isNccMntner(mntBy.value);
            }) < 0
        ) {
            // findIndex returns -1 if not found
            return;
        }
        let attr = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'sponsoring-org');
        if (attr) {
            attr.$$meta.$$disable = true;
        }
        attr = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'org');
        if (attr) {
            attr.$$meta.$$disable = true;
        }
    }

    private disableNetnameAttribute(attributes: any) {
        const allocationStatuses = ['ALLOCATED PA', 'ALLOCATED UNSPECIFIED', 'ALLOCATED-BY-RIR'];

        if (_.includes(allocationStatuses, this.whoisResourcesService.getSingleAttributeOnName(attributes, 'status').value)) {
            const netnameAttr = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'netname');
            if (netnameAttr) {
                netnameAttr.$$meta.$$disable = true;
            }
        }
    }

    private disableAssignmentAttributes(attributes: any) {
        const assSizeAttr = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'assignment-size');
        if (assSizeAttr) {
            assSizeAttr.$$meta.$$disable = true;
        }
    }

    private _disableOrgWhenStatusIsAssignedPI(attributes: any) {
        const statusAttr = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'status');
        if (statusAttr && statusAttr.value === 'ASSIGNED PI') {
            const org = this.whoisResourcesService.getSingleAttributeOnName(attributes, 'org');
            if (org) {
                org.$$meta.$$disable = true;
            }
        }
        return attributes;
    }

    private handlePendingAuthenticationError(source: string, status: number, whoisResources: any) {
        if (this._isPendingAuthenticationError(status, whoisResources)) {
            this.messageStore.add(this.whoisResourcesService.getPrimaryKey(whoisResources), this._composePendingResponse(whoisResources, source));
            return true;
        }
        return false;
    }

    private _isPendingAuthenticationError(httpStatus: number, whoisResources: any) {
        let status = false;
        if (httpStatus === 400) {
            status = _.some(whoisResources.errormessages.errormessage, (item: any) => {
                return item.severity === 'Warning' && item.text === 'This update has only passed one of the two required hierarchical authorisations';
            });
        }
        console.info('_isPendingAuthenticationError:' + status);
        return status;
    }

    private _composePendingResponse(resp: any, source: string) {
        const found = _.find(resp.errormessages.errormessage, (item: any) => {
            return item.severity === 'Error' && item.text === `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`;
        });

        if (!_.isUndefined(found) && found.args.length >= 4) {
            const obstructingType = found.args[0].value;
            const obstructingName = found.args[1].value;
            const mntnersToConfirm = found.args[3].value;

            const obstructingObjectLink = this.linkService.getLink(source, obstructingType, obstructingName);
            const mntnersToConfirmLinks = this.linkService.filterAndCreateTextWithLinksForMntners(source, mntnersToConfirm);

            const moreInfoUrl = '/docs/Authorisation/Protection-of-Route-Object-Space/#creating-route-objects-referring-to-resources-you-don-t-manage';
            const moreInfoLink = `<a target="_blank" href="${moreInfoUrl}">Click here for more information</a>.`;

            const pendngMsg =
                'Your object is still pending authorisation by a maintainer of the ' +
                '<strong>' +
                obstructingType +
                '</strong> object ' +
                obstructingObjectLink +
                '. ' +
                'Please ask them to confirm, by submitting the same object as outlined below ' +
                'using syncupdates or mail updates, and authenticate it using the maintainer ' +
                mntnersToConfirmLinks +
                '. ' +
                moreInfoLink;

            // Keep existing message and overwrite existing errors
            resp.errormessages.errormessage = [{ severity: 'Info', text: pendngMsg }];
        }
        // otherwise keep existing response

        return resp;
    }

    private _getInterceptorFunc(objectType: string, actionName: any) {
        if (_.isUndefined(this.objectInterceptors[objectType])) {
            console.error('Object-type ' + objectType + ' not understood');
            return undefined;
        }
        if (_.isUndefined(this.objectInterceptors[objectType][actionName])) {
            console.info('Interceptor-function ' + objectType + '.' + actionName + ' not found');
            return undefined;
        }
        return this.objectInterceptors[objectType][actionName];
    }
}
