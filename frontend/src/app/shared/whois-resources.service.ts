import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { PropertiesService } from '../properties.service';
import { ObjectUtilService } from '../updatesweb/object-util.service';
import { WhoisMetaService } from './whois-meta.service';
import { IAttributeModel, IMntByModel, IObjectMessageModel, IWhoisObjectModel, IWhoisResponseModel } from './whois-response-type.model';

@Injectable()
export class WhoisResourcesService {
    private readonly allowedEmptyAttrs = ['remarks', 'descr', 'certif', 'address'];

    constructor(private whoisMetaService: WhoisMetaService, private propertiesService: PropertiesService) {}

    public addAttributeAfter(attributes: IAttributeModel[], attr: IAttributeModel, after: any) {
        const metaClone = {};
        let hasMeta = false;
        if (attr.$$meta && typeof attr.$$meta === 'object') {
            Object.keys(attr.$$meta).forEach((itemKey) => {
                metaClone[itemKey] = attr.$$meta[itemKey];
                hasMeta = true;
            });
        }
        const foundAt = after.$$hashKey
            ? _.findIndex(attributes, { name: after.name, value: after.value, $$hashKey: after.$$hashKey })
            : _.findIndex(attributes, { name: after.name, value: after.value });

        const attrCopy: IAttributeModel = { name: attr.name, value: attr.value };
        if (hasMeta) {
            attrCopy.$$meta = metaClone;
        }
        attributes.splice(foundAt + 1, 0, attrCopy);
        return attributes;
    }

    public addAttributeAfterType(attributes: IAttributeModel[], attr: IAttributeModel, after: any) {
        const result: IAttributeModel[] = [];
        let found = false;
        _.each(attributes, (next: IAttributeModel) => {
            result.push(next);
            if (found === false && next.name === after.name) {
                result.push({ name: attr.name, value: attr.value });
                found = true;
            }
        });

        return result;
    }

    public addAttrsSorted(attributes: IAttributeModel[], attrTypeName: string, attrs: IAttributeModel[]) {
        const lastIdxOfType = _.findLastIndex(attributes, (item) => {
            return item.name === attrTypeName;
        });
        if (lastIdxOfType > -1) {
            const lastItemDetail = attributes[lastIdxOfType];
            const result: IAttributeModel[] = [];
            let idx = 0;
            _.each(attributes, (attr: IAttributeModel) => {
                result.push(attr);
                if (idx === lastIdxOfType) {
                    _.each(attrs, (item: IAttributeModel) => {
                        const newItem = _.cloneDeep(lastItemDetail);
                        newItem.value = item.value;
                        result.push(newItem);
                    });
                }
                idx++;
            });

            return result;
        } else {
            return attributes.concat(attrs);
        }
    }

    private addBelowLastOf(attrs: IAttributeModel[], attrTypeName: string, item: any) {
        const last = _.last(
            _.filter(attrs, (attr) => {
                return attr.name === attrTypeName;
            }),
        );
        const result: IAttributeModel[] = [];
        _.each(attrs, (next) => {
            result.push(next);
            if (next.name === last.name && next.value === last.value) {
                result.push(item);
            }
        });
        return result;
    }

    public addMissingMandatoryAttribute(attributes: IAttributeModel[], objectType: string, attr: IAttributeModel) {
        return this.addBelowLastOf(attributes, this.getFirstMandatoryAttrAbove(objectType, attr.name), attr);
    }

    private attributeWithNameExists(attrs: IAttributeModel[], attributeName: string): boolean {
        return _.some(attrs, (attribute: IAttributeModel) => {
            return attribute.name === attributeName;
        });
    }

    public canAttributeBeDuplicated(attr: IAttributeModel) {
        return attr.$$meta.$$multiple === true;
    }

    public canAttributeBeRemoved(attributes: IAttributeModel[], attr: IAttributeModel) {
        let status = false;
        if (attr.$$meta.$$mandatory === false) {
            status = true;
        } else if (attr.$$meta.$$multiple && WhoisResourcesService.getAllAttributesOnName(attributes, attr.name).length > 1) {
            status = true;
        }

        return status;
    }

    public getFilterableAttrsForObjectTypes(targetObjectTypes: any) {
        const attrsToFilterOn: string[] = [];
        _.each(targetObjectTypes, (objectType) => {
            _.each(this.whoisMetaService.getMetaAttributesOnObjectType(objectType.toLowerCase(), false), (metaAttr) => {
                if ((metaAttr.primaryKey === true || metaAttr.searchable === true) && !_.includes(attrsToFilterOn, metaAttr.name)) {
                    attrsToFilterOn.push(metaAttr.name);
                }
            });
        });
        return attrsToFilterOn;
    }

    public getViewableAttrsForObjectTypes(targetObjectTypes: any) {
        return this.getFilterableAttrsForObjectTypes(targetObjectTypes);
    }

    public turnAttrsIntoWhoisObject(attrs: IAttributeModel[]) {
        return {
            objects: {
                object: [{ attributes: { attribute: attrs } }],
            },
        };
    }

    public turnAttrsIntoWhoisObjects(attrsList: any) {
        // list of attribute-arrays ia passed along
        const wrapped = _.map(attrsList, (attrs) => {
            let packed;
            const first = attrs[0];
            if (!_.isUndefined(first)) {
                packed = { type: first.name, attributes: { attribute: attrs } };
            }
            return packed;
        });
        return {
            objects: {
                object: wrapped,
            },
        };
    }

    public static readableError(message: IObjectMessageModel) {
        let idx = 0;
        return message.text.replace(/%s|%d/g, (match) => {
            if (message.args.length - 1 >= idx) {
                const arg = message.args[idx].value;
                idx++;
                return arg;
            } else {
                return match;
            }
        });
    }

    public static getReadableObjectMessages(whoisObject: IWhoisObjectModel) {
        return whoisObject.objectmessages?.objectmessage?.map((message: IObjectMessageModel) => this.readableError(message)) ?? [];
    }

    public getGlobalErrors(whoisResponse: any) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage.filter((errorMessage: IObjectMessageModel) => {
            errorMessage.plainText = WhoisResourcesService.readableError(errorMessage);
            return errorMessage.severity === 'Error' && !errorMessage.attribute;
        });
    }

    public getGlobalWarnings(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage.filter((errorMessage: IObjectMessageModel) => {
            errorMessage.plainText = WhoisResourcesService.readableError(errorMessage);
            return errorMessage.severity === 'Warning' && !errorMessage.attribute;
        });
    }

    public getGlobalInfos(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage.filter((errorMessage: IObjectMessageModel) => {
            errorMessage.plainText = WhoisResourcesService.readableError(errorMessage);
            return errorMessage.severity === 'Info' && !errorMessage.attribute;
        });
    }

    public getAllErrors(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage.filter((errorMessage: IObjectMessageModel) => {
            errorMessage.plainText = WhoisResourcesService.getRelatedAttribute(errorMessage) + WhoisResourcesService.readableError(errorMessage);
            return errorMessage.severity === 'Error';
        });
    }

    public getAllWarnings(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage.filter((errorMessage: IObjectMessageModel) => {
            errorMessage.plainText = WhoisResourcesService.getRelatedAttribute(errorMessage) + WhoisResourcesService.readableError(errorMessage);
            return errorMessage.severity === 'Warning';
        });
    }

    public getAllInfos(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage.filter((errorMessage: IObjectMessageModel) => {
            errorMessage.plainText = WhoisResourcesService.getRelatedAttribute(errorMessage) + WhoisResourcesService.readableError(errorMessage);
            return errorMessage.severity === 'Info';
        });
    }

    public clearErrors(attributes: IAttributeModel[]) {
        _.map(attributes, (attr: IAttributeModel) => {
            attr.$$error = undefined;
        });
    }

    public getErrorsOnAttribute(whoisResponse: IWhoisResponseModel, attributeName: string, attributeValue: any) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage.filter((errorMessage: IObjectMessageModel) => {
            if (errorMessage.attribute) {
                errorMessage.plainText = WhoisResourcesService.readableError(errorMessage);
                return errorMessage.attribute.name === attributeName && errorMessage.attribute.value.trim() === attributeValue;
            }
            return false;
        });
    }

    public getAuthenticationCandidatesFromError(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.errormessages) {
            return [];
        }
        const myMsgs = _.filter(whoisResponse.errormessages.errormessage, (msg: IObjectMessageModel) => {
            return msg.severity === 'Error' && msg.text === `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`;
        });

        // FIXME PUT TYPE
        const mntners: any[] = [];
        _.each(myMsgs, (msg) => {
            const candidates = msg.args[3].value;
            _.each(candidates.split(','), (mntner) => {
                if (!_.includes(mntners, mntner)) {
                    mntners.push(mntner);
                }
            });
        });
        return mntners;
    }

    public getRequiresAdminRightFromError(whoisResponse: IWhoisResponseModel) {
        return _.some(whoisResponse.errormessages.errormessage, (msg: IObjectMessageModel) => {
            return msg.text === 'Deleting this object requires administrative authorisation';
        });
    }

    private static getRelatedAttribute(errorMessage: IObjectMessageModel) {
        if (errorMessage.attribute && typeof errorMessage.attribute.name === 'string') {
            return errorMessage.attribute.name + ': ';
        }
        return '';
    }

    private getFirstMandatoryAttrAbove(objectType: string, attrTypeName: string) {
        const metaAttrs = this.whoisMetaService.getMandatoryAttributesOnObjectType(objectType);
        const idx = _.findIndex(metaAttrs, (item: IAttributeModel) => {
            return item.name === attrTypeName;
        });
        return metaAttrs[Math.max(0, idx - 1)].name;
    }

    public getPrimaryKey(whoisResponse: IWhoisResponseModel) {
        if (_.isUndefined(whoisResponse.objects)) {
            return undefined;
        }
        const keys = _.map(whoisResponse.objects.object[0]['primary-key'].attribute, (item) => {
            return item.value;
        });

        /* just append without any separators */
        return keys.join('');
    }

    public getSource(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.objects) {
            return undefined;
        }
        return whoisResponse.objects.object[0].source.id;
    }

    private getObjectType(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.objects || !whoisResponse.objects.object || whoisResponse.objects.object.length === 0) {
            return undefined;
        }
        const obj = whoisResponse.objects.object[0];

        let objectType;
        if (obj.type) {
            objectType = obj.type;
        } else if (obj.attributes.attribute[0].name) {
            objectType = obj.attributes.attribute[0].name;
        } else {
            console.error('No object type found for ' + JSON.stringify(this));
        }
        return objectType;
    }

    public isFiltered(whoisResponse: IWhoisResponseModel) {
        const sourceAttribute = this.getSingleAttributeOnName(this.getAttributes(whoisResponse), 'source');
        return sourceAttribute && sourceAttribute.comment === 'Filtered';
    }

    public getAttributes(whoisResponse: IWhoisResponseModel) {
        if (!whoisResponse.objects) {
            return [];
        }
        return whoisResponse.objects.object[0].attributes.attribute;
    }

    public getAttributesForObjectOfType(whoisresources: IWhoisResponseModel, typename: string) {
        if (_.isUndefined(whoisresources.objects)) {
            return [];
        }
        const object = _.find(whoisresources.objects.object, (item) => {
            return item.attributes.attribute[0].name === typename;
        });
        if (_.isUndefined(object)) {
            return [];
        }

        return object.attributes.attribute;
    }

    public static getAllAttributesOnName(attributes: IAttributeModel[], attributeName: string) {
        return _.filter(attributes, (attribute) => {
            return attribute.name === attributeName;
        });
    }

    public getAllAttributesWithValueOnName(attributes: IAttributeModel[], attributeName: string) {
        return attributes.filter((attribute) => {
            return attribute.value && attribute.name === attributeName;
        });
    }

    public getSingleAttributeOnName(attributes: IAttributeModel[], name: string) {
        return attributes.find((attr: IAttributeModel) => {
            return attr.name === name;
        });
    }

    public setSingleAttributeOnName(attributes: IAttributeModel[], name: string, value: any) {
        let found = false;
        return _.map(attributes, (attr: IAttributeModel) => {
            if (attr.name === name && found === false) {
                attr.value = value;
                found = true;
            }
            return attr;
        });
    }

    public getMissingMandatoryAttributes(attributes: IAttributeModel[], objectType: string) {
        const missingAttrs: IAttributeModel[] = [];
        _.each(this.whoisMetaService.getMandatoryAttributesOnObjectType(objectType), (item) => {
            if (!this.attributeWithNameExists(attributes, item.name)) {
                missingAttrs.push(item);
            }
        });
        return missingAttrs;
    }

    public removeAttribute(attributes: IAttributeModel[], attr: IAttributeModel) {
        return _.filter(attributes, (next: IAttributeModel) => {
            return attr !== next;
        });
    }

    public removeAttributeWithName(attributes: IAttributeModel[], attrName: string) {
        return _.remove(attributes, (next: IAttributeModel) => {
            return next.name === attrName;
        });
    }

    public removeNullAttributes(attributes: IAttributeModel[]) {
        const filtered = _.filter(attributes, (attr: IAttributeModel) => {
            const allowedEmpty = _.includes(this.allowedEmptyAttrs, attr.name);
            if (allowedEmpty) {
                return true;
            }
            return attr.value;
        });

        return _.map(filtered, (item: IAttributeModel) => {
            if (_.isUndefined(item.value)) {
                item.value = '';
            }
            return item;
        });
    }

    public duplicateAttribute(attributes: IAttributeModel[], attr: IAttributeModel) {
        const metaClone = {};
        Object.keys(attr.$$meta).forEach((itemKey) => {
            metaClone[itemKey] = attr.$$meta[itemKey];
        });
        const foundAt = _.findIndex(attributes, { name: attr.name, value: attr.value });
        const attrCopy = { name: attr.name, value: '', $$meta: metaClone };
        attributes.splice(foundAt + 1, 0, attrCopy);
        return attributes;
    }

    private isValidWhoisResources(whoisResources: IWhoisResponseModel) {
        if (_.isUndefined(whoisResources) || _.isNull(whoisResources)) {
            console.error('isValidWhoisResources: Null input:' + JSON.stringify(whoisResources));
            return false;
        }
        if (
            (_.isUndefined(whoisResources.objects) || _.isNull(whoisResources.objects)) &&
            (_.isUndefined(whoisResources.errormessages) || _.isNull(whoisResources.errormessages))
        ) {
            console.error('isValidWhoisResources: Missing objects and errormessages:' + JSON.stringify(whoisResources));
            return false;
        }

        return true;
    }

    public validate(attributes: IAttributeModel[]) {
        let errorFound = false;
        _.each(attributes, (attr: IAttributeModel) => {
            if (attr.$$meta.$$mandatory === true && !attr.value && this.getAllAttributesWithValueOnName(attributes, attr.name).length === 0) {
                attr.$$error = 'Mandatory attribute not set';
                errorFound = true;
            } else {
                attr.$$error = undefined;
            }
        });
        return errorFound === false;
    }

    public validateWhoisResources(whoisResources: any) {
        return this.isValidWhoisResources(whoisResources) ? whoisResources : undefined;
    }

    public validateAttributes(attrs: any) {
        return attrs ? attrs : [];
    }

    public validateWithoutSettingErrors(attributes: IAttributeModel[]) {
        return !attributes.some((attr: IAttributeModel) => {
            return (
                attr.$$invalid ||
                attr.$$error ||
                (attr.$$meta.$$mandatory === true && !attr.value && this.getAllAttributesWithValueOnName(attributes, attr.name).length === 0)
            );
        });
    }

    public getAddableAttributes(attributes: IAttributeModel[], objectType: string, attrs: IAttributeModel[]) {
        return _.filter(this.whoisMetaService.getAllAttributesOnObjectType(objectType), (attr: IAttributeModel) => {
            if (attr.name === 'created') {
                return false;
            } else if (attr.name === 'last-modified') {
                return false;
            } else if (attr.$$meta.$$multiple === true) {
                return true;
            } else if (attr.$$meta.$$mandatory === false) {
                if (
                    !_.some(attrs, (a) => {
                        return a.name === attr.name;
                    })
                ) {
                    return true;
                }
            }
            return false;
        });
    }

    public toString(object: IWhoisObjectModel) {
        return JSON.stringify(object);
    }

    public toPlaintext(attributes: IAttributeModel[]) {
        let result = '';
        _.each(attributes, (attr: IAttributeModel) => {
            result += attr.name + ':' + WhoisResourcesService.repeat(' ', Math.max(0, 20 - attr.name.length)) + _.trim(attr.value) + '\n';
        });
        return result;
    }

    private wrap(whoisResources: IWhoisResponseModel): IWhoisResponseModel {
        let result: IWhoisResponseModel = whoisResources;
        if (!_.isUndefined(whoisResources) && this.isValidWhoisResources(whoisResources)) {
            const objectType = this.getObjectType(whoisResources);
            if (!_.isUndefined(objectType) && !_.isUndefined(this.getAttributes(whoisResources))) {
                whoisResources.objects.object[0].attributes.attribute = this.wrapAndEnrichAttributes(objectType, this.getAttributes(whoisResources));
            }
            result = whoisResources;
        }
        return result;
    }

    public wrapAndEnrichAttributes(objectType: string, attrs: IAttributeModel[]) {
        return this.validateAttributes(this.whoisMetaService.enrichAttributesWithMetaInfo(objectType, attrs));
    }

    public wrapSuccess(whoisResources: IWhoisResponseModel): any {
        return this.wrap(whoisResources);
    }

    public wrapError(error: any) {
        let whoisResources: any;

        if (error) {
            if (error.data) {
                whoisResources = error.data;
            } else if (error.config && error.config.data) {
                whoisResources = error.config.data;
            } else if (error.error) {
                whoisResources = error.error;
            }
        } else {
            error = {};
        }
        if (!this.isValidWhoisResources(whoisResources)) {
            whoisResources = {};
            whoisResources.errormessages = {};
            whoisResources.errormessages.errormessage = [];
            whoisResources.errormessages.errormessage.push({
                severity: 'Error',
                text: 'Unexpected error: please retry later',
            });
        }
        error.data = this.wrap(whoisResources);
        return error;
    }

    public canDeleteObject(attributes: IAttributeModel[], maintainers?: Array<IMntByModel | IAttributeModel>): boolean {
        // enable delete objects maintained by RIPE NCC mnts on all environments except PROD
        if (this.propertiesService.isEnableNonAuthUpdates()) {
            return !ObjectUtilService.isLirObject(attributes);
        }
        return !this.isComaintained(attributes, maintainers) && !ObjectUtilService.isLirObject(attributes);
    }

    // Resource is with Ncc Mntner
    public isComaintained(attributes: IAttributeModel[], maintainers?: Array<IMntByModel | IAttributeModel>) {
        maintainers = !!maintainers ? maintainers : WhoisResourcesService.getAllAttributesOnName(attributes, 'mnt-by');
        return maintainers.some((att: IMntByModel | IAttributeModel) => {
            let value: string;
            if ('value' in att) {
                value = att.value.trim();
            } else if ('key' in att) {
                value = att.key.trim();
            } else {
                throw new Error(`wrong type for [${att}]`);
            }
            return this.propertiesService.isAnyNccMntner(value);
        });
    }

    public isComaintainedWithNccHmMntner(attributes: any) {
        return WhoisResourcesService.getAllAttributesOnName(attributes, 'mnt-by').some((mnt) => this.propertiesService.isNccHmMntner(mnt.value));
    }

    private static repeat(text: string, n: number) {
        return new Array(n + 1).join(text);
    }
}
