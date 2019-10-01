import {Injectable} from "@angular/core";
import {WhoisMetaService} from "./whois-meta.service";
import {IAttributeModel, IErrorMessageModel, IWhoisResponseModel} from "./whois-response-type.model";

@Injectable()
export class WhoisResourcesService {

    private readonly allowedEmptyAttrs = ["remarks", "descr", "certif", "address"];

    constructor(private whoisMetaService: WhoisMetaService) {
    }

    public getFilterableAttrsForObjectTypes(targetObjectTypes: any) {
        const attrsToFilterOn: string[] = [];
        _.each(targetObjectTypes, (objectType) => {
            _.each(this.whoisMetaService.getMetaAttributesOnObjectType(objectType.toLowerCase(), false), (metaAttr) => {
                if ((metaAttr.primaryKey === true || metaAttr.searchable === true) && !_.contains(attrsToFilterOn, metaAttr.name)) {
                    attrsToFilterOn.push(metaAttr.name);
                }
            });
        });
        return attrsToFilterOn;
    }

    public getViewableAttrsForObjectTypes(targetObjectTypes: any) {
        return this.getFilterableAttrsForObjectTypes(targetObjectTypes);
    }

    public toString = (object: any) => () => {
        return JSON.stringify(object);
    };

    public wrapAndEnrichAttributes(objectType: string, attrs: IAttributeModel[]) {
        return this.wrapAttributes(this.whoisMetaService.enrichAttributesWithMetaInfo(objectType, attrs));
    }

    public turnAttrsIntoWhoisObject(attrs: IAttributeModel[]) {
        return{
            objects: {
                object: [
                    { attributes: { attribute: attrs } },
                ],
            },
        };
    }

    public turnAttrsIntoWhoisObjects(attrsList: any) {
        // list of attribute-arrays ia passed along
        const wrapped = _.map(attrsList, (attrs) => {
            let packed;
            const first = attrs[0];
            if (!_.isUndefined(first)) {
                packed = {type: first.name, attributes: {attribute: attrs}};
            }
            return packed;
        });
        return {
            objects: {
                object: wrapped,
            },
        };
    }

    public readableError = (whoisResponse: IWhoisResponseModel) => (errorMessage: IErrorMessageModel) => {
        let idx = 0;
        return errorMessage.text.replace(/%s/g, (match: any) => {
            if (errorMessage.args.length - 1 >= idx) {
                const arg = errorMessage.args[idx].value;
                idx++;
                return arg;
            } else {
                return match;
            }
        });
    };

    // private
    public getGlobalErrors = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage
            .filter((errorMessage: any) => {
                errorMessage.plainText = this.readableError(whoisResponse)(errorMessage);
                return errorMessage.severity === "Error" && !errorMessage.attribute;
            });
    };

    // private
    public getAllErrors = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage
            .filter((errorMessage: any) => {
                errorMessage.plainText = this._getRelatedAttribute(errorMessage) + this.readableError(whoisResponse)(errorMessage);
                return errorMessage.severity === "Error";
            });
    };

    public getAuthenticationCandidatesFromError = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        const myMsgs =  _.filter(whoisResponse.errormessages.errormessage, (msg: IErrorMessageModel) => {
            return msg.severity === "Error" &&
                msg.text === `Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s`;
        });

        // FIXME PUT TYPE
        const mntners: any[] = [];
        _.each(myMsgs, (msg) => {
            const candidates = msg.args[3].value;
            _.each(candidates.split(","), (mntner) => {
                if (!_.contains(mntners, mntner)) {
                    mntners.push(mntner);
                }
            });
        });
        return mntners;
    };

    // private
    public getRequiresAdminRightFromError = (whoisResponse: IWhoisResponseModel) => () => {
        return _.any(whoisResponse.errormessages.errormessage, (msg: IErrorMessageModel) => {
            return msg.text === "Deleting this object requires administrative authorisation";
        });
    };
    // private
    public _getRelatedAttribute(errorMessage: IErrorMessageModel) {
        if (errorMessage.attribute && typeof errorMessage.attribute.name === "string") {
            return errorMessage.attribute.name + ": ";
        }
        return "";
    }
    // private
    public getGlobalWarnings = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage
            // FIXME ANY TYPE
            .filter((errorMessage: any) => {
                errorMessage.plainText = this.readableError(whoisResponse)(errorMessage);
                return errorMessage.severity === "Warning" && !errorMessage.attribute;
            });
    };
    // private
    public getAllWarnings = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage
        // FIXME ANY TYPE
            .filter((errorMessage: any) => {
                errorMessage.plainText = this._getRelatedAttribute(errorMessage) +  this.readableError(whoisResponse)(errorMessage);
                return errorMessage.severity === "Warning";
            });
    };
    // private
    public getGlobalInfos = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage
        // FIXME ANY TYPE
            .filter((errorMessage: any) => {
                errorMessage.plainText = this.readableError(whoisResponse)(errorMessage);
                return errorMessage.severity === "Info" && !errorMessage.attribute;
            });
    };
    // private
    public getAllInfos = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage
            .filter((errorMessage: any) => {
                errorMessage.plainText = this._getRelatedAttribute(errorMessage) +  this.readableError(whoisResponse)(errorMessage);
                return errorMessage.severity === "Info";
            });
    };
    // private
    public getErrorsOnAttribute = (whoisResponse: IWhoisResponseModel) => (attributeName: string, attributeValue: any) => {
        if (!whoisResponse.errormessages) {
            return [];
        }
        return whoisResponse.errormessages.errormessage
            .filter((errorMessage: any) => {
                if (errorMessage.attribute) {
                    errorMessage.plainText = this.readableError(whoisResponse)(errorMessage);
                    return errorMessage.attribute.name === attributeName && errorMessage.attribute.value.trim() === attributeValue;
                }
                return false;
            });
    };
    // private
    public getPrimaryKey = (whoisResponse: IWhoisResponseModel) => () => {
        if (_.isUndefined(whoisResponse.objects)) {
            return undefined;
        }
        const keys = _.map(whoisResponse.objects.object[0]["primary-key"].attribute, (item) => {
            return item.value;
        });

        /* just append without any separators */
        return keys.join("");
    };
    // private
    public getSource = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.objects) {
            return undefined;
        }
        return whoisResponse.objects.object[0].source.id;
    };
    // private
    public getObjectType = (whoisResponse: IWhoisResponseModel) => () => {
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
            console.error("No object type found for " + JSON.stringify(this));
        }
        return objectType;
    };
    // private
    public isFiltered = (whoisResponse: IWhoisResponseModel) => () => {
        const sourceAttribute = this.getSingleAttributeOnName(this.getAttributes(whoisResponse)())("source");
        // const sourceAttribute = getSingleAttributeOnName.call(whoisResponse.getAttributes(), "source");
        return (sourceAttribute && sourceAttribute.comment === "Filtered");
    };
    // private
    public getAttributes = (whoisResponse: IWhoisResponseModel) => () => {
        if (!whoisResponse.objects) {
            return [];
        }
        return whoisResponse.objects.object[0].attributes.attribute;
    };

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
    // private
    public isValidWhoisResources(whoisResources: IWhoisResponseModel) {
        if (_.isUndefined(whoisResources) || _.isNull(whoisResources)) {
            console.error("isValidWhoisResources: Null input:" + JSON.stringify(whoisResources));
            return false;
        }
        if ((_.isUndefined(whoisResources.objects)       || _.isNull(whoisResources.objects))
            && (_.isUndefined(whoisResources.errormessages) ||  _.isNull(whoisResources.errormessages))) {
            console.error("isValidWhoisResources: Missing objects and errormessages:" + JSON.stringify(whoisResources));
            return false;
        }

        return true;
    }

    // public wrapWhoisResources(whoisResources: IWhoisResponseModel) {
    public wrapWhoisResources(whoisResources: any) {
        if (!this.isValidWhoisResources(whoisResources)) {
            return undefined;
        }
        // enrich data with methods
        whoisResources.wrapped = true;
        whoisResources.toString = this.toString(whoisResources);
        whoisResources.readableError = this.readableError(whoisResources);
        whoisResources.getAllErrors = this.getAllErrors(whoisResources);
        whoisResources.getGlobalErrors = this.getGlobalErrors(whoisResources);
        whoisResources.getAuthenticationCandidatesFromError = this.getAuthenticationCandidatesFromError(whoisResources);
        whoisResources.getRequiresAdminRightFromError = this.getRequiresAdminRightFromError(whoisResources);
        whoisResources.getAllWarnings = this.getAllWarnings(whoisResources);
        whoisResources.getGlobalWarnings = this.getGlobalWarnings(whoisResources);
        whoisResources.getAllInfos = this.getAllInfos(whoisResources);
        whoisResources.getGlobalInfos = this.getGlobalInfos(whoisResources);
        whoisResources.getErrorsOnAttribute = this.getErrorsOnAttribute(whoisResources);
        whoisResources.getAttributes = this.getAttributes(whoisResources);
        whoisResources.getPrimaryKey = this.getPrimaryKey(whoisResources);
        whoisResources.getSource = this.getSource(whoisResources);
        whoisResources.getObjectType = this.getObjectType(whoisResources);
        whoisResources.isFiltered = this.isFiltered(whoisResources);

        return whoisResources;
    }
    // private
    public getSingleAttributeOnName = (attributes: IAttributeModel[]) => (name: string) => {
        return _.find(attributes, (attr: IAttributeModel) => {
            return attr.name === name;
        });
    };
    // private
    public getAllAttributesOnName = (attributes: IAttributeModel[]) => (attributeName: string) => {
        return _.filter(attributes, (attribute) => {
                return attribute.name === attributeName;
            });
    };
    // private
    public getAllAttributesWithValueOnName = (attributes: IAttributeModel[]) => (attributeName: string) => {
        return _.filter(attributes, (attribute) => {
                return attribute.value && attribute.name === attributeName;
            });
    };
    // private
    public addAttrsSorted = (attributes: IAttributeModel[]) => (attrTypeName: string, attrs: IAttributeModel[]) => {
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
            // TODO smarter merge
            return attributes.concat(attrs);
        }
    };
    // private
    public setSingleAttributeOnName = (attributes: IAttributeModel[]) => (name: string, value: any) => {
        let found = false;
        return _.map(attributes, (attr: IAttributeModel) => {
            if (attr.name === name && found === false) {
                attr.value = value;
                found = true;
            }
            return attr;
        });
    };
    // private
    public validate = (attributes: IAttributeModel[]) => () => {
        let errorFound = false;
        _.each(attributes, (attr: IAttributeModel) => {
            // if (attr.$$meta.$$mandatory === true && ! attr.value && self.getAllAttributesWithValueOnName(attr.name).length === 0 ) {
            if (attr.$$meta.$$mandatory === true && ! attr.value && this.getAllAttributesWithValueOnName(attributes)(attr.name).length === 0) {
                attr.$$error = "Mandatory attribute not set";
                errorFound = true;
            } else {
                attr.$$error = undefined;
            }
        });
        return errorFound === false;
    };
    // private
    public validateWithoutSettingErrors = (attributes: IAttributeModel[]) => () => {
        return !_.any(attributes, (attr: IAttributeModel) => {
            return attr.$$invalid || attr.$$meta.$$mandatory === true && !attr.value && this.getAllAttributesWithValueOnName(attributes)(attr.name).length === 0;
        });
    };
    // private
    public clearErrors = (attributes: IAttributeModel[]) => () => {
        _.map(attributes, (attr: IAttributeModel) => {
            attr.$$error = undefined;
        });
    };
    // private
    public removeAttribute = (attributes: IAttributeModel[]) => (attr: IAttributeModel) => {
        return _.filter(attributes, (next: IAttributeModel) => {
            return attr !== next;
        });
    };
    // private
    public removeAttributeWithName = (attributes: IAttributeModel[]) => (attrName: string) => {
        return _.remove(attributes, (next: IAttributeModel) => {
            return next.name === attrName;
        });
    };
    // private
    public duplicateAttribute = (attributes: IAttributeModel[]) => (attr: IAttributeModel) => {
        const metaClone = {};
        Object.keys(attr.$$meta).forEach((itemKey) => {
            metaClone[itemKey] = attr.$$meta[itemKey];
        });
        const foundAt = _.findIndex(attributes, { name: attr.name, value: attr.value });
        const attrCopy = { name: attr.name, value: "", $$meta: metaClone };
        attributes.splice(foundAt + 1, 0, attrCopy);
        return attributes;
    };
    // private
    public canAttributeBeDuplicated = (attributes: IAttributeModel[]) => (attr: IAttributeModel) => {
        return attr.$$meta.$$multiple === true;
    };
    // private
    public canAttributeBeRemoved = (attributes: IAttributeModel[]) => (attr: IAttributeModel) => {
        let status = false;
        if (attr.$$meta.$$mandatory === false) {
            status = true;
        } else if (attr.$$meta.$$multiple && this.getAllAttributesOnName(attributes)(attr.name).length > 1) {
            status = true;
        }

        return status;
    };
    // private
    public addAttributeAfter = (attributes: IAttributeModel[]) => (attr: IAttributeModel, after: any) => {
        const metaClone = {};
        let hasMeta = false;
        if (attr.$$meta && typeof attr.$$meta === "object") {
            Object.keys(attr.$$meta).forEach((itemKey) => {
                metaClone[itemKey] = attr.$$meta[itemKey];
                hasMeta = true;
            });
        }
        const foundAt = after.$$hashKey ? _.findIndex(attributes, {name: after.name, value: after.value, $$hashKey: after.$$hashKey})
                                        : _.findIndex(attributes, {name: after.name, value: after.value});

        const attrCopy: IAttributeModel = { name: attr.name, value: attr.value };
        if (hasMeta) {
            attrCopy.$$meta = metaClone;
        }
        attributes.splice(foundAt + 1, 0, attrCopy);
        return attributes;
    };
    // private
    public getAddableAttributes = (attributes: IAttributeModel[]) => (objectType: string, attrs: IAttributeModel[]) => {
        return _.filter(this.whoisMetaService.getAllAttributesOnObjectType(objectType), (attr: IAttributeModel) => {
            if (attr.name === "created  ") {
                return false;
            } else if (attr.name === "last-modified") {
                return false;
            } else if (attr.$$meta.$$multiple === true) {
                return true;
            } else if (attr.$$meta.$$mandatory === false) {
                if (!_.some(attrs, (a) => {
                        return a.name === attr.name;
                    })) {
                    return true;
                }
            }
            return false;
        });
    };
    // private
    public addAttributeAfterType = (attributes: IAttributeModel[]) => (attr: IAttributeModel, after: any) => {
        const result: IAttributeModel[] = [];
        let found = false;
        _.each(attributes, (next: IAttributeModel) => {
            result.push(next);
            if (found === false && next.name === after.name) {
                result.push({name: attr.name, value: attr.value});
                found = true;
            }
        });

        return result;
    };
    // private
    public removeNullAttributes = (attributes: IAttributeModel[]) => () => {
        const filtered = _.filter(attributes, (attr: IAttributeModel) => {
            const allowedEmpty = _.includes(this.allowedEmptyAttrs, attr.name);
            if (allowedEmpty) {
                return true;
            }
            return attr.value;
        });

        return _.map(filtered, (item: IAttributeModel) => {
            if (_.isUndefined(item.value)) {
                item.value = "";
            }
            return item;
        });
    };
    // private
    public toPlaintext = (attributes: IAttributeModel[]) => () => {
        let result = "";
        _.each(attributes, (attr: IAttributeModel) => {
            result += attr.name + ":" + this._repeat(" ", Math.max(0, (20 - attr.name.length))) + _.trim(attr.value) + "\n";
        });
        return result;
    };
    // private
    public _repeat(text: string, n: number) {
        return new Array(n + 1).join(text);
    }
    // private
    public attributeWithNameExists(attrs: IAttributeModel[], attributeName: string): boolean {
        return _.any(attrs, (attribute: IAttributeModel) => {
            return attribute.name === attributeName;
        });
    }
    // private
    public getMissingMandatoryAttributes = (attributes: IAttributeModel[]) => (objectType: string) => {
        const missingAttrs: IAttributeModel[] = [];
        _.each(this.whoisMetaService.getMandatoryAttributesOnObjectType(objectType), (item) => {
            if (!this.attributeWithNameExists(attributes, item.name)) {
                missingAttrs.push(item);
            }
        });
        return missingAttrs;
    };
    // private
    public getFirstMandatoryAttrAbove(objectType: string, attrTypeName: string) {
        const metaAttrs =  this.whoisMetaService.getMandatoryAttributesOnObjectType(objectType);
        const idx = _.findIndex(metaAttrs, (item: IAttributeModel) => {
            return item.name === attrTypeName;
        });
        return metaAttrs[Math.max(0, idx - 1)].name;
    }
    // private
    public addBelowLastOf(attrs: IAttributeModel[], attrTypeName: string, item: any) {
        const last =  _.last(_.filter(attrs, (attr) => {
                return attr.name === attrTypeName;
            }));
        const result: IAttributeModel[] = [];
        _.each(attrs, (next) => {
            result.push(next);
            if (next.name === last.name && next.value === last.value) {
                result.push(item);
            }
        });
        return result;
    }
    // private
    public addMissingMandatoryAttribute = (attributes: IAttributeModel[]) => (objectType: string, attr: IAttributeModel) => {
        return this.addBelowLastOf(attributes, this.getFirstMandatoryAttrAbove(objectType, attr.name), attr);
    };

    public wrapAttributes(attrs: any) {
        if (!attrs) {
            return [];
        }
        attrs.toString = this.toString(attrs);
        attrs.toPlaintext = this.toPlaintext(attrs);
        attrs.getAllAttributesOnName = this.getAllAttributesOnName(attrs);
        attrs.getAllAttributesWithValueOnName = this.getAllAttributesWithValueOnName(attrs);
        attrs.getSingleAttributeOnName = this.getSingleAttributeOnName(attrs);
        attrs.setSingleAttributeOnName = this.setSingleAttributeOnName(attrs);
        attrs.addAttrsSorted = this.addAttrsSorted(attrs);
        attrs.validate = this.validate(attrs);
        attrs.validateWithoutSettingErrors = this.validateWithoutSettingErrors(attrs);
        attrs.clearErrors = this.clearErrors(attrs);
        attrs.getAddableAttributes = this.getAddableAttributes(attrs);

        attrs.removeAttributeWithName = this.removeAttributeWithName(attrs); // mutates array
        attrs.removeAttribute = this.removeAttribute(attrs);
        attrs.duplicateAttribute = this.duplicateAttribute(attrs);
        attrs.canAttributeBeDuplicated = this.canAttributeBeDuplicated(attrs);
        attrs.canAttributeBeRemoved = this.canAttributeBeRemoved(attrs);
        attrs.addAttributeAfter = this.addAttributeAfter(attrs);
        attrs.addAttributeAfterType = this.addAttributeAfterType(attrs);
        attrs.removeNullAttributes = this.removeNullAttributes(attrs);
        attrs.getMissingMandatoryAttributes = this.getMissingMandatoryAttributes(attrs);
        attrs.addMissingMandatoryAttribute = this.addMissingMandatoryAttribute(attrs);
        return attrs;
    }

    public wrap(whoisResources: IWhoisResponseModel): IWhoisResponseModel {
        let result: IWhoisResponseModel = whoisResources;
        if (!_.isUndefined(whoisResources) && this.isValidWhoisResources(whoisResources)) {
            const wrapped = this.wrapWhoisResources(whoisResources);
            const objectType = wrapped.getObjectType();
            if (!_.isUndefined(objectType) && !_.isUndefined(wrapped.getAttributes())) {
                wrapped.objects.object[0].attributes.attribute =
                    this.wrapAndEnrichAttributes(objectType, wrapped.getAttributes());
            }
            result = wrapped;
        }
        return result;
    }
    // should return IWhoisResponseModel
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
            whoisResources.errormessages.errormessage.push(
                {severity: "Error", text: "Unexpected error: please retry later"},
            );
        }

        error.data = this.wrap(whoisResources);

        return error;
    }
}
