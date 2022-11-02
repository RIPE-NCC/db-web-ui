import { Injectable } from '@angular/core';
import { Address4 } from 'ip-address';
import * as _ from 'lodash';
import { JsUtilService } from '../core/js-utils.service';
import { PrefixService } from '../domainobject/prefix.service';
import { PrefixServiceUtils } from '../domainobject/prefix.service.utils';
import { IpAddressService } from '../myresources/ip-address.service';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { AttributeSharedService } from './attribute-shared.service';

@Injectable()
export class AttributeMetadataService {
    public hostnameRe = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/;
    // Notes on metadata structure:
    //
    // Example 1
    // ---------
    //
    // 'admin-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
    //
    // should be read: admin-c is a mandatory field which can be added as many times as you like
    // (minOccurs:1,  [by default]).
    //
    // It uses an autocomplete mechanism which refers to 'person' and 'role' objects.
    //
    // It should be hidden when EITHER the prefix OR any nserver values are invalid
    //
    // Example 2
    // ---------
    // nserver: {..., invalid: new RegExp('^[a-z]{2,999}$'), hidden: testFunction}
    //
    // Attribute value is invalid if it does NOT match the RegExp, i.e. the regex should
    // match a valid value.
    //
    // Attribute will be hidden if the function 'testFunction' returns true. The function
    // will be invoked like this:
    //
    //     result = testFunction(objectType, attributes, attribute);
    //
    public objectMetadata: any;

    /*
     * Metadata evaluation functions
     *
     * https://jira.ripe.net/browse/DB-220
     *
     * If there is an existing domain within the specified prefix, display an error.
     * Find any domain objects for a given prefix, using TWO queries:
     *
     * (1) exact match: -d --exact -T domain -r 193.193.200.0 - 193.193.200.255
     *
     * (2) ALL more specific (excluding exact match) : -d --all-more -T domain -r ...
     *
     * If any domain objects are returned from either query, then display an error.
     */
    public existingDomains = {};
    public existingDomainTo: any;
    private timeout: any;
    private lastPrefix: any;
    private cachedResponses = {};

    constructor(
        private jsUtils: JsUtilService,
        private prefixService: PrefixService,
        private whoisMetaService: WhoisMetaService,
        private whoisResourcesService: WhoisResourcesService,
        private attributeSharedService: AttributeSharedService,
    ) {
        this.objectMetadata = this.makeObjectMetadata();
    }

    // Defaults:
    // * attributes are shown
    // * attribute values are valid -except-
    // * empty primary key values are invalid
    // * when attribute cardinality is 1..* and it's not on the form, or value is empty

    // The flags used in the metadata contradict the defaults, e.g. you have to set an
    // attribute to "hidden" if you don't want to show it. This means the metadata only
    // has to provide overrides and can therefore be pretty small

    public determineAttributesForNewObject(objectType: string): IAttributeModel[] {
        const attributes: IAttributeModel[] = [];
        _.forEach(this.getAllMetadata(objectType), (val, key) => {
            if (val.minOccurs) {
                for (let i = 0; i < val.minOccurs; i++) {
                    attributes.push({ name: key, value: '' });
                }
            }
        });
        return attributes;
    }

    public enrich = (objectType: string, attributes: any) => {
        const arg: any[] = [objectType, attributes];
        this.jsUtils.checkTypes(arg, ['string', 'array']);
        for (let i = 0; i < attributes.length; i++) {
            attributes[i].$$invalid = this.isInvalid(objectType, attributes, attributes[i]);
            attributes[i].$$hidden = this.isHidden(objectType, attributes, attributes[i]);
            attributes[i].$$disable = this.isReadOnly(objectType, attributes, attributes[i]);
            attributes[i].$$id = 'attr-' + i;
        }
    };

    public isHidden = (objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) => {
        const arg: any[] = [objectType, attributes, attribute];
        this.jsUtils.checkTypes(arg, ['string', 'array', 'object']);
        const md = this.getMetadata(objectType, attribute.name);
        if (!md || !md.hidden) {
            return false;
        }
        return this.evaluateMetadata(objectType, attributes, attribute, md.hidden);
    };

    public isInvalid = (objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) => {
        const arg: any[] = [objectType, attributes, attribute];
        this.jsUtils.checkTypes(arg, ['string', 'array', 'object']);
        const md = this.getMetadata(objectType, attribute.name);
        if (md) {
            if (md.invalid) {
                // use invalid to check it
                return this.evaluateMetadata(objectType, attributes, attribute, md.invalid);
            } else if (md.primaryKey || md.minOccurs > 0) {
                // pks and mandatory must have value
                return !attribute.value;
            }
        }
        return false;
    };

    public getAllMetadata(objectType: string) {
        const objectTypeLowerCase = objectType.toLowerCase();
        this.jsUtils.checkTypes([objectTypeLowerCase], ['string']);
        if (!this.objectMetadata[objectTypeLowerCase.toLowerCase()]) {
            throw Error('There is no metadata for ' + objectTypeLowerCase);
        }
        return this.objectMetadata[objectTypeLowerCase.toLowerCase()];
    }

    public getMetadata(objectType: string, attributeName: string) {
        const objectTypeLowerCase = objectType.toLowerCase();
        const arg: any[] = [objectTypeLowerCase, attributeName];
        this.jsUtils.checkTypes(arg, ['string', 'string']);
        if (!this.objectMetadata[objectTypeLowerCase]) {
            throw Error('There is no metadata for ' + objectTypeLowerCase);
        }
        return this.objectMetadata[objectTypeLowerCase][attributeName];
    }

    public getCardinality(objectType: string, attributeName: string) {
        const arg: any[] = [objectType, attributeName];
        this.jsUtils.checkTypes(arg, ['string', 'string']);
        const result = {
            maxOccurs: -1,
            minOccurs: 0,
        };
        const md = this.getMetadata(objectType, attributeName);
        if (md.minOccurs > 0) {
            result.minOccurs = Math.max(md.minOccurs, 0);
        }
        if (md.maxOccurs > 0) {
            result.maxOccurs = Math.max(md.maxOccurs, -1);
        }
        return result;
    }

    public resetDomainLookups(prefix: any) {
        if (this.jsUtils.typeOf(prefix) === 'string') {
            delete this.existingDomains[prefix];
        }
    }

    public clearLastPrefix() {
        this.lastPrefix = '';
    }

    public isList(objectType: string, attribute: IAttributeModel): boolean {
        const md = this.getMetadata(objectType, attribute.name);
        if (md) {
            if (md.staticList || md.refs) {
                return true;
            }
        }
        return false;
    }

    public setLinkToQueryPage(flag: string, prefix: string): string {
        if (prefix !== '') {
            const link = `query?bflag=true&dflag=true&hierarchyFlag=${flag}&rflag=true&searchtext=${prefix}&source=RIPE&types=domain`;
            return `Domain(s) <a href="${link}" target='_blank'>already exist</a> under this prefix`;
        }
        return prefix;
    }

    public static splitAttrsCommentsFromValue(attributes: IAttributeModel[], edited?: boolean) {
        attributes.map((attribute: IAttributeModel) => {
            if (attribute.value) {
                if (attribute.value.indexOf('#') > -1) {
                    attribute.comment = attribute.value.substring(attribute.value.indexOf('#') + 1, attribute.value.length).trim();
                    attribute.value = attribute.value.substring(0, attribute.value.indexOf('#')).trim();
                } else if (edited) {
                    attribute.comment = undefined;
                }
            }
        });
    }

    public domainsAlreadyExist = (objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) => {
        if (!attribute.value) {
            attribute.$$info = '';
            attribute.$$error = '';
            return true;
        }
        const existing = this.existingDomains[attribute.value];
        if (existing && _.isNumber(existing.domainsInTheWay)) {
            if (existing.hierarchyFlag) {
                attribute.$$info = '';
                attribute.$$error = this.setLinkToQueryPage(existing.hierarchyFlag, attribute.value);
            } else {
                attribute.$$info = 'Prefix looks OK';
                attribute.$$error = '';
            }
            return !!existing.hierarchyFlag;
        }
        const doCall = () => {
            // otherwise find the domains and put them in the cache
            this.prefixService.findExistingDomainsForPrefix(attribute.value).subscribe({
                next: (results: any) => {
                    let domainsInTheWay = 0;
                    let hierarchyFlag: string;
                    _.forEach(results, (result: any) => {
                        if (result && result.body && result.body.objects) {
                            domainsInTheWay += result.body.objects.object.length;
                            hierarchyFlag = result.url.indexOf('flags=drx') > -1 ? 'exact' : 'all-more';
                        }
                    });
                    this.existingDomains[attribute.value] = {
                        domainsInTheWay,
                        hierarchyFlag,
                    };
                    // let the evaluation engine know that we've got a new value
                    this.attributeSharedService.stateChanged(attribute);
                },
                error: () => {
                    const domainsInTheWay = 0;
                    this.existingDomains[attribute.value] = {
                        domainsInTheWay,
                        undefined,
                    };
                },
            });
        };
        if (this.existingDomainTo) {
            clearTimeout(this.existingDomainTo);
        }
        this.existingDomainTo = setTimeout(doCall, 600);
        return true;
    };

    public prefixIsInvalid = (objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel): boolean => {
        if (!attribute.value) {
            attribute.$$info = '';
            attribute.$$error = '';
            return true;
        }

        if (this.lastPrefix === attribute.value) {
            // don't bother. it's just an extraneous evaluation of the prefix
            return;
        }

        this.cachedResponses = {}; // prefix changed, so empty the cache
        if (PrefixServiceUtils.isValidPrefix(attribute.value)) {
            this.lastPrefix = attribute.value;
            this.attributeSharedService.prefixOk(attribute.value);
            attribute.$$info = 'Prefix looks OK';
            attribute.$$error = '';
            return false;
        }

        attribute.$$info = '';
        const cidrAddress = IpAddressService.getCidrAddress(attribute.value);
        if (cidrAddress instanceof Address4 && cidrAddress.subnetMask > 24) {
            attribute.$$error = "Please use the <a target='_blank' href='syncupdates'>Syncupdates page</a> to create a domain object smaller than /24";
        } else if (cidrAddress instanceof Address4 && cidrAddress.subnetMask < 16) {
            attribute.$$error = 'Cannot create domain objects for prefixes larger than /16';
        } else {
            attribute.$$error = 'Invalid prefix notation';
        }
        return true;
    };

    private isReadOnly = (objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel): boolean => {
        const arg: any[] = [objectType, attributes, attribute];
        this.jsUtils.checkTypes(arg, ['string', 'array', 'object']);
        const md = this.getMetadata(objectType, attribute.name);
        if (!md || !md.readOnly) {
            return false;
        }
        return this.evaluateMetadata(objectType, attributes, attribute, md.readOnly);
    };

    private evaluateMetadata = (objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel, attrMetadata: any): boolean => {
        const arg: any[] = [objectType, attributes, attribute];
        this.jsUtils.checkTypes(arg, ['string', 'array', 'object']);
        if (this.jsUtils.typeOf(attrMetadata) === 'boolean') {
            return attrMetadata;
        }
        if (this.jsUtils.typeOf(attrMetadata) === 'function') {
            try {
                attribute.$$error = '';
                return attrMetadata(objectType, attributes, attribute);
            } catch (e) {
                attribute.$$error = e;
                return true;
            }
        }
        if (this.jsUtils.typeOf(attrMetadata) === 'regexp') {
            if (this.jsUtils.typeOf(attribute.value) !== 'string') {
                return true;
            }
            // negate cz test is for IN-valid or UN-hidden (i.e. "visible") & regex is for a +ve match
            return !attrMetadata.test(attribute.value);
        }
        if (this.jsUtils.typeOf(attrMetadata) === 'array') {
            // handles { ..., invalid: [RegExp, invalid: ["attr1", "attr2"], Function]}
            return (
                -1 !==
                _.findIndex(attrMetadata, (item: any) => {
                    if (this.jsUtils.typeOf(item) === 'string') {
                        // must be "invalid" or "hidden" or "readOnly"
                        if (attrMetadata[item]) {
                            return this.evaluateMetadata(objectType, attributes, attribute, attrMetadata[item]);
                        } else {
                            // not handled
                            return false;
                        }
                    } else {
                        return this.evaluateMetadata(objectType, attributes, attribute, item);
                    }
                })
            );
        }
        // Otherwise, go through the "invalid" and "hidden" properties and return the first true result
        // First, check it's valid metadata
        if (this.jsUtils.typeOf(attrMetadata) !== 'object' || !(attrMetadata.invalid || attrMetadata.hidden || attrMetadata.readOnly)) {
            return false;
        }

        let target;
        // Evaluate the "invalid's and return the first true result
        if (this.jsUtils.typeOf(attrMetadata.invalid) === 'string') {
            target = _.filter(attributes, (o) => {
                return o.name === attrMetadata.invalid;
            });
            for (let i in target) {
                target[i].$$invalid = this.isInvalid(objectType, attributes, target[i]);
                if (target[i].$$invalid) {
                    return true;
                }
            }
        } else if (this.jsUtils.typeOf(attrMetadata.invalid) === 'array') {
            return (
                -1 !==
                _.findIndex(attrMetadata.invalid, (attrName) => {
                    // filter takes care of multiple attributes with the same name
                    target = _.filter(attributes, (o) => {
                        return o.name === attrName;
                    });
                    for (let i in target) {
                        target[i].$$invalid = this.isInvalid(objectType, attributes, target[i]);
                        if (target[i].$$invalid) {
                            return true;
                        }
                    }
                })
            );
        }
        // TODO: "hidden" and "readOnly" - string and array
        return false;
    };

    private nserverIsInvalid = (objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) => {
        if (!attribute.value) {
            return true;
        }

        const reverseZone = _.find(attributes, (item) => {
            return item.name === 'reverse-zone';
        });

        if (!reverseZone || !reverseZone.value.length) {
            // no zones?
            attribute.$$info = '';
            attribute.$$error = 'No reverse zones';
            return true;
        }

        if (attribute.value && IpAddressService.getCidrAddress(attribute.value)) {
            attribute.$$info = '';
            attribute.$$error = 'IP notation not allowed, use a fully qualified domain name';
            return true;
        }
        // check it looks sth like a hostname
        if (!this.hostnameRe.exec(attribute.value)) {
            attribute.$$info = '';
            attribute.$$error = '';
            return true;
        }
        let keepTrying = 4;
        const sameValList = _.filter(attributes, (attr: IAttributeModel) => {
            return attribute.name === attr.name && attribute.value === attr.value;
        });
        if (sameValList.length > 1) {
            // should have found itself once, otherwise it's a dupe
            attribute.$$info = '';
            attribute.$$error = 'Duplicate value';
            return true;
        }
        if (_.isObject(this.cachedResponses[attribute.value])) {
            const result = this.cachedResponses[attribute.value];
            if (result.code === 0) {
                attribute.$$info = result.message;
                attribute.$$error = '';
                attribute.$$invalid = false;
            } else {
                attribute.$$info = '';
                attribute.$$error = result.message;
                attribute.$$invalid = true;
            }
            return attribute.$$invalid;
        }

        const doCall = () => {
            attribute.$$info = 'Checking name server...';
            attribute.$$error = '';
            // any reverse zone will do
            this.prefixService.checkNameserverAsync(attribute.value, reverseZone.value[0].value).subscribe({
                next: (resp: any) => {
                    if (!resp || !_.isNumber(resp.code)) {
                        this.cachedResponses[attribute.value] = { code: -1, message: 'No response during check' };
                        return;
                    }
                    const nserverResult: any = resp;
                    if (nserverResult.ns !== attribute.value) {
                        // ignore this result. input has changed since req was fired
                        return;
                    }
                    this.cachedResponses[attribute.value] = nserverResult;
                    // put response in cache
                    this.attributeSharedService.stateChanged(attribute);
                },
                error: (err: any) => {
                    if (err.status === 404) {
                        this.cachedResponses[attribute.value] = { code: -1, message: 'FAILED' };
                        this.attributeSharedService.stateChanged(attribute);
                    } else if (keepTrying) {
                        keepTrying -= 1;
                        if (this.timeout) {
                            clearTimeout(this.timeout);
                        }
                        this.timeout = setTimeout(doCall, 1000);
                    } else {
                        this.cachedResponses[attribute.value] = { code: -1, message: 'FAILED' };
                        this.attributeSharedService.stateChanged(attribute);
                    }
                },
            });
        };
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(doCall, 600);
        // This is a wrapper for an async call, so should return "true" (invalid). The
        // async response will set the success/errors.
        return this.jsUtils.typeOf(attribute.$$invalid) === 'boolean' ? attribute.$$invalid : true;
    };

    private isModifyMode(objectType: string, attributes: IAttributeModel[]): boolean {
        // If "created" is filled, we"re modifying
        const created = _.find(attributes, (item: IAttributeModel) => {
            return item.name.toUpperCase() === 'CREATED';
        });
        return created && typeof created.value === 'string';
    }

    private isComaintained = (objectType: string, attributes: any): boolean => {
        return this.whoisResourcesService.isComaintained(attributes);
    };

    private isNetnameDisabled = (objectType: string, attributes: any): boolean => {
        return this.whoisResourcesService.isComaintainedWithNccHmMntner(attributes);
    };

    // Notes on metadata structure:
    //
    // Example 1
    // ---------
    //
    // "admin-c": {minOccurs: 1, refs: ["person", "role"], hidden: {invalid: ["prefix", "nserver"]}},
    //
    // should be read: admin-c is a mandatory field which can be added as many times as you like
    // (minOccurs:1,  [by default]).
    //
    // It uses an autocomplete mechanism which refers to "person" and "role" objects.
    //
    // It should be hidden when EITHER the prefix OR any nserver values are invalid
    //
    // Example 2
    // ---------
    // nserver: {..., invalid: new RegExp("^[a-z]{2,999}$"), hidden: testFunction}
    //
    // Attribute value is invalid if it does NOT match the RegExp, i.e. the regex should
    // match a valid value.
    //
    // Attribute will be hidden if the function "testFunction" returns true. The function
    // will be invoked like this:
    //
    //     result = testFunction(objectType, attributes, attribute);
    //

    private convertMeta(obj: any) {
        const newObj = {};

        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            const o = obj[key];
            const n = {};

            for (const i of Object.keys(o.attributes)) {
                const a = o.attributes[i];
                const p: any = {};
                if (a.primaryKey) {
                    p.primaryKey = a.primaryKey;
                    p.maxOccurs = 1;
                    p.minOccurs = 1;
                }
                if (a.mandatory) {
                    p.minOccurs = 1;
                }
                if (!a.multiple) {
                    p.maxOccurs = 1;
                }
                if (a.refs && a.refs.length > 0) {
                    p.refs = a.refs;
                }
                if (a.searchable) {
                    p.searchable = a.searchable;
                }
                if (a.isEnum) {
                    p.staticList = true;
                }
                n[a.name] = p;
            }
            newObj[key] = n;
        }
        return newObj;
    }

    private makeObjectMetadata() {
        const metadata: any = this.convertMeta(this.whoisMetaService.objectTypesMap);

        // add some custom wizard-related attributes hostname
        metadata.domain.nserver = { minOccurs: 2 };

        /* eslint-disable */
        metadata.prefix = {
            prefix: {
                hidden: { invalid: ['mnt-by'] },
                invalid: [this.prefixIsInvalid, this.domainsAlreadyExist],
                maxOccurs: 1,
                minOccurs: 1,
                primaryKey: true,
            },
            descr: {},
            nserver: { minOccurs: 2, hidden: { invalid: 'prefix' }, invalid: this.nserverIsInvalid },
            'reverse-zone': { minOccurs: 1, maxOccurs: 1, hidden: { invalid: ['prefix', 'nserver'] } },
            'ds-rdata': {},
            org: { refs: ['organisation'] },
            'admin-c': { minOccurs: 1, refs: ['person', 'role'], hidden: { invalid: ['prefix', 'nserver'] } },
            'tech-c': { minOccurs: 1, refs: ['person', 'role'], hidden: { invalid: ['prefix', 'nserver'] } },
            'zone-c': { minOccurs: 1, refs: ['person', 'role'], hidden: { invalid: ['prefix', 'nserver'] } },
            remarks: {},
            notify: {},
            'mnt-by': { minOccurs: 1, refs: ['mntner'] },
            created: { maxOccurs: 1 },
            'last-modified': { minOccurs: 0, maxOccurs: 1 },
            source: { readOnly: true, minOccurs: 1, maxOccurs: 1, hidden: { invalid: ['mnt-by'] } },
        };
        /* eslint-enable */

        // Here we assume that the basic rules are the same for these attributes
        const attrs = ['aut-num', 'inetnum', 'inet6num'];
        for (const a of Object.keys(attrs)) {
            const aName = attrs[a];
            metadata[aName][aName].invalid = [];
            metadata[aName][aName].hidden = { invalid: ['mnt-by'] };
            metadata[aName][aName].readOnly = this.isModifyMode;
            metadata[aName].org.readOnly = this.isComaintained;
            metadata[aName]['sponsoring-org'].readOnly = true;
            metadata[aName].status.readOnly = this.isModifyMode;
            metadata[aName].source.readOnly = this.isModifyMode;
        }
        metadata.inetnum.netname.readOnly = this.isNetnameDisabled;
        metadata.inet6num.netname.readOnly = this.isNetnameDisabled;
        return metadata;
    }
}
