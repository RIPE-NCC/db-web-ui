'use strict';

angular.module('dbWebApp')
    .service('WhoisResources', [ '$log', 'WhoisMetaService', function ($log, WhoisMetaService) {

        var allowedEmptyAttrs = ['remarks','descr', 'certif', 'address'];

        this.getAttributeShortDescription = function( objectType, attrName ) {
            return WhoisMetaService.getAttributeShortDescription(objectType, attrName);
        };

        this.getAttributeDescription = function( objectType, attrName ) {
            return WhoisMetaService.getAttributeDescription(objectType, attrName);
        };

        this.getAttributeSyntax = function (objectType, attrName) {
            return WhoisMetaService.getAttributeSyntax(objectType, attrName);
        };

        this._getMetaAttributesOnObjectType = function (objectTypeName, mandatoryOnly) {
            return WhoisMetaService._getMetaAttributesOnObjectType(objectTypeName, mandatoryOnly);
        };

        this.findMetaAttributeOnObjectTypeAndName = function(objectTypeName, attributeName) {
            return WhoisMetaService.findMetaAttributeOnObjectTypeAndName(objectTypeName, attributeName);
        };

        this.getObjectTypes = function () {
            return WhoisMetaService.getObjectTypes();
        };

        this.enrichAttributesWithMetaInfo = function( objectTypeName, attrs ) {
            return WhoisMetaService.enrichAttributesWithMetaInfo(objectTypeName, attrs);
        };

        this.getAllAttributesOnObjectType = function (objectTypeName) {
            return WhoisMetaService.getAllAttributesOnObjectType(objectTypeName);
        };

        this.getFilterableAttrsForObjectTypes  = function (targetObjectTypes) {
            var attrsToFilterOn = [];
            _.each( targetObjectTypes, function(objectType) {
                _.each(WhoisMetaService._getMetaAttributesOnObjectType(objectType.toLowerCase(), false), function(metaAttr) {
                    if (( metaAttr.primaryKey === true || metaAttr.searchable === true ) && !_.contains(attrsToFilterOn, metaAttr.name)) {
                        attrsToFilterOn.push(metaAttr.name);
                    }
                });
            });
            $log.info('attrsToFilterOn:'+attrsToFilterOn);
            return attrsToFilterOn;
        };

        this.getViewableAttrsForObjectTypes  = function (targetObjectTypes) {
            return this.getFilterableAttrsForObjectTypes(targetObjectTypes);
        };

        this.getMandatoryAttributesOnObjectType = function (objectTypeName) {
            return WhoisMetaService.getMandatoryAttributesOnObjectType(objectTypeName);
        };

        var toString = function() {
            return JSON.stringify(this);
        };

        this.wrapAndEnrichAttributes = function (objectType, attrs) {
            return this.wrapAttributes(
                this.enrichAttributesWithMetaInfo(objectType, attrs)
            );
        };

        this.turnAttrsIntoWhoisObject = function( attrs ) {
            return{
                objects:{
                    object: [
                        { attributes: { attribute: attrs } }
                    ]
                }
            };
        };

        this.turnAttrsIntoWhoisObjects = function( attrsList ) {
            // list of attribute-arrays ia passed along
            var wrapped = _.map(attrsList, function(attrs) {
                var packed;
                var first = attrs[0];
                if (!_.isUndefined(first)) {
                    packed = {type: first.name, attributes: {attribute: attrs}};
                }
                return packed;
            });
            return {
                objects: {
                    object: wrapped
                }
            };
        };

        var readableError = function( errorMessage ) {
            var idx=0;
            var readableErrorText = errorMessage.text.replace(/%s/g, function(match) {
                if( errorMessage.args.length-1 >= idx ) {
                    var arg = errorMessage.args[idx].value;
                    idx++;
                    return arg;
                } else {
                    return match;
                }
            });
            return readableErrorText;
        };

        var getGlobalErrors = function () {
            if( ! this.errormessages ) {
                return [];
            }
            var self = this;
            return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = self.readableError(errorMessage);
                    return errorMessage.severity === 'Error' && !errorMessage.attribute;
                });
        };

        var getAllErrors = function () {
            if( ! this.errormessages ) {
                return [];
            }
            var self = this;
            return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = _getRelatedAttribute(errorMessage) + self.readableError(errorMessage);
                    return errorMessage.severity === 'Error';
                });
        };

        var getAuthenticationCandidatesFromError = function() {
            if( ! this.errormessages ) {
                return [];
            }
            var myMsgs =  _.filter(this.errormessages.errormessage, function (msg) {
                if (msg.severity === 'Error' &&
                    msg.text === 'Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s') {
                    return true;
                }
                return false;
            });

            var mntners = [];
            _.each(myMsgs, function(msg) {
                var candidates = msg.args[3].value;
                _.each(candidates.split(','), function(mntner) {
                    if (!_.contains(mntners, mntner)) {
                        mntners.push(mntner);
                    }
                });
            });
            return mntners;
        };

        var getRequiresAdminRightFromError = function() {
            return _.any(this.errormessages.errormessage, function (msg) {
                return msg.text === 'Deleting this object requires administrative authorisation';
            });
        };

        function _getRelatedAttribute( errorMessage ) {
            if (errorMessage.attribute && typeof errorMessage.attribute.name === 'string') {
                return errorMessage.attribute.name + ': ';
            }
            return '';
        }

         var getGlobalWarnings = function () {
             if (! this.errormessages) {
                 return [];
             }

             var self = this;
             return this.errormessages.errormessage.filter(
                 function (errorMessage) {
                     errorMessage.plainText = self.readableError(errorMessage);
                     return errorMessage.severity === 'Warning' && !errorMessage.attribute;
                 });
        };

        var getAllWarnings = function () {
            if( ! this.errormessages ) {
                return [];
            }

            var self = this;
            return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = _getRelatedAttribute(errorMessage) +  self.readableError(errorMessage);
                    return errorMessage.severity === 'Warning';
                });
        };
         var getGlobalInfos = function () {
             if( ! this.errormessages ) {
                 return [];
             }

             var self = this;
             return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = self.readableError(errorMessage);
                    return errorMessage.severity === 'Info' && !errorMessage.attribute;
                });
        };

        var getAllInfos = function () {
            if( ! this.errormessages ) {
                return [];
            }

            var self = this;
            return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = _getRelatedAttribute(errorMessage) +  self.readableError(errorMessage);
                    return errorMessage.severity === 'Info';
                });
        };

        var getErrorsOnAttribute = function (attributeName, attributeValue) {
            if( ! this.errormessages ) {
                return [];
            }
            var self = this;
            return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    if (errorMessage.attribute) {
                        errorMessage.plainText = self.readableError(errorMessage);
                        return errorMessage.attribute.name === attributeName && errorMessage.attribute.value === attributeValue;
                    }
                    return false;
                });
        };

        var getPrimaryKey = function () {
            if(_.isUndefined(this.objects) ) {
                return undefined;
            }
            var keys =_.map(this.objects.object[0]['primary-key'].attribute, function( item) {
                return item.value;
            });

            /* just append without any separators */
            return keys.join( '');
        };

        var getSource = function () {
            if( ! this.objects ) {
                return undefined;
            }
            return this.objects.object[0].source.id;
        };

        var getObjectType = function () {
            if (!this.objects || !this.objects.object || this.objects.object.length === 0 ) {
                return undefined;
            }
            var obj = this.objects.object[0];

            var objectType;
            if ( obj.type ) {
                objectType = obj.type;
            } else if( obj.attributes.attribute[0].name ) {
                objectType = obj.attributes.attribute[0].name;
            } else {
                $log.error('No object type found for ' + JSON.stringify(this));
            }
            return objectType;
        };

        var isFiltered = function () {
            var sourceAttribute = getSingleAttributeOnName.call(this.getAttributes(), 'source');
            return (sourceAttribute && sourceAttribute.comment === 'Filtered');
        };

        var getAttributes = function () {
            if( ! this.objects ) {
                return [];
            }
            return this.objects.object[0].attributes.attribute;
        };

        this.getAttributesForObjectOfType = function (whoisresources, typename) {
            if(_.isUndefined(whoisresources.objects) ) {
                return [];
            }
            var object = _.find(whoisresources.objects.object, function(item) {
                return item.attributes.attribute[0].name === typename;
            });
            if( _.isUndefined(object) ) {
                return [];
            }

            return object.attributes.attribute;
        };

        var getAttributesForObjectWithIndex = function (idx) {
            if(_.isUndefined(this.objects) ) {
                return [];
            }
            if( idx >= this.objects.object.length ) {
                return [];
            }
            return this.objects.object[idx].attributes.attribute;
        };

        function isValidWhoisResources( whoisResources) {
            if(_.isUndefined(whoisResources) || _.isNull(whoisResources)) {
                $log.error('isValidWhoisResources: Null input:' + JSON.stringify(whoisResources));
                return false;
            }
            if( (_.isUndefined(whoisResources.objects)       || _.isNull(whoisResources.objects) ) &&
                (_.isUndefined(whoisResources.errormessages) ||  _.isNull(whoisResources.errormessages) ) ) {
                $log.error('isValidWhoisResources: Missing objects and errormessages:' + JSON.stringify(whoisResources));
                return false;
            }

            return true;
        }

        var objectNamesAsAttributes = function( attributeType) {
            return _.map(this.objects.object,  function (obj) {
                return { name: attributeType, value:obj['primary-key'].attribute[0].value };
            });
        };

        this.wrapWhoisResources = function( whoisResources ) {
            if ( !  isValidWhoisResources(whoisResources) ) {
                return undefined;
            }
            // enrich data with methods
            whoisResources.wrapped = true;
            whoisResources.toString = toString;
            whoisResources.readableError = readableError;
            whoisResources.getAllErrors = getAllErrors;
            whoisResources.getGlobalErrors = getGlobalErrors;
            whoisResources.getAuthenticationCandidatesFromError = getAuthenticationCandidatesFromError;
            whoisResources.getRequiresAdminRightFromError = getRequiresAdminRightFromError;
            whoisResources.getAllWarnings = getAllWarnings;
            whoisResources.getGlobalWarnings = getGlobalWarnings;
            whoisResources.getAllInfos = getAllInfos;
            whoisResources.getGlobalInfos = getGlobalInfos;
            whoisResources.getErrorsOnAttribute = getErrorsOnAttribute;
            whoisResources.getAttributes = getAttributes;
            whoisResources.getAttributesForObjectWithIndex = getAttributesForObjectWithIndex;
            whoisResources.getPrimaryKey = getPrimaryKey;
            whoisResources.getSource = getSource;
            whoisResources.getObjectType = getObjectType;
            whoisResources.isFiltered = isFiltered;
            whoisResources.objectNamesAsAttributes = objectNamesAsAttributes;

            return whoisResources;
        };

        var getSingleAttributeOnName = function (name) {
            return _.find(this,  function (attr) {
                return attr.name === name;
            });
        };

       var getAllAttributesNotOnName = function (attributeName) {
            return _.filter(this,
                function (attribute) {
                    return attribute.name !== attributeName;
                });
        };


        var getAllAttributesOnName = function (attributeName) {
            return _.filter(this,
                function (attribute) {
                    return attribute.name === attributeName;
                });
        };

        var getAllAttributesWithValueOnName = function (attributeName) {
            return _.filter(this,
                function (attribute) {
                    return attribute.value && attribute.name === attributeName;
                });
        };

        var addAttrsSorted = function (attrTypeName, attrs) {
            var lastIdxOfType = _.findLastIndex( this, function(item) {
                return item.name === attrTypeName;
            });
            if( lastIdxOfType > -1 ) {
                var lastItemDetail = this[lastIdxOfType];

                var result = [];
                var idx = 0;
                _.each(this, function (attr) {
                    result.push(attr);
                    if (idx === lastIdxOfType) {
                        _.each(attrs, function (item) {
                            var newItem = _.cloneDeep(lastItemDetail);
                            newItem.value = item.value;
                            result.push(newItem);
                        });
                    }
                    idx++;
                });

                return result;
            } else {
                // TODO smarter merge
                return this.concat(attrs);
            }
        };

        var setSingleAttributeOnName = function( name, value) {
            var found = false;
             return _.map(this, function(attr) {
                if( attr.name === name && found === false) {
                    attr.value = value;
                    found = true;
                }
                return attr;
            });
        };

        var validate = function() {
            var errorFound = false;

            var self = this;
            _.each(this, function (attr) {
                if (attr.$$meta.$$mandatory === true && ! attr.value && self.getAllAttributesWithValueOnName(attr.name).length === 0 ) {
                    attr.$$error = 'Mandatory attribute not set';
                    errorFound = true;
                } else {
                    attr.$$error = undefined;
                }
            });
            return errorFound === false;
        };

        var validateWithoutSettingErrors = function() {
            var self = this;
            return !_.any(this, function (attr) {
                return attr.$$meta.$$mandatory === true && ! attr.value && self.getAllAttributesWithValueOnName(attr.name).length === 0;
            });
        };

        var clearErrors = function() {
            _.map(this, function (attr) {
                attr.$$error = undefined;
            });
        };

        var removeAttribute = function(attr) {
            return _.filter(this, function(next) {
                return attr !== next;
            });
        };

        var removeAttributeWithType = function(attrName) {
            return _.filter(this, function(next) {
                return next.name !== attrName;
            });
        };

        var removeAttributeWithName = function(attrName) {
            return _.remove(this, function(next) {
                return next.name === attrName;
            });
        };

        var duplicateAttribute = function(attr) {
            var metaClone = {};
            Object.keys(attr.$$meta).forEach(function(itemKey) {
                metaClone[itemKey] = attr.$$meta[itemKey];
            });
            var foundAt = _.findIndex(this, { name: attr.name, value: attr.value });
            var attrCopy = { name: attr.name, value: '', $$meta: metaClone };
            this.splice(foundAt + 1, 0, attrCopy);
            return this;
        };

        var canAttributeBeDuplicated = function( attr) {
            return attr.$$meta.$$multiple === true;
        };

        var canAttributeBeRemoved = function( attr) {
            var status = false;

            if( attr.$$meta.$$mandatory === false ) {
                status = true;
            } else if(attr.$$meta.$$multiple && this.getAllAttributesOnName(attr.name).length > 1 ) {
                status = true;
            }

            return status;
        };

        var addAttributeAfter = function(attr, after) {
            var metaClone = {}, hasMeta = false;;
            if (attr.$$meta && typeof attr.$$meta === 'object') {
                Object.keys(attr.$$meta).forEach(function(itemKey) {
                    metaClone[itemKey] = attr.$$meta[itemKey];
                    hasMeta = true;
                });
            }
            var foundAt = _.findIndex(this, { name: after.name, value: after.value });
            var attrCopy = { name: attr.name, value: attr.value }
            if (hasMeta) {
                attrCopy.$$meta = metaClone;
            }
            this.splice(foundAt + 1, 0, attrCopy);
            return this;
        };

        var getAddableAttributes = function(objectType,attributes) {
            return _.filter(WhoisMetaService.getAllAttributesOnObjectType(objectType), function (attr) {
                if( attr.name === 'created  ' ) {
                    return false;
                } else if( attr.name === 'last-modified' ) {
                    return false;
                } else if( attr.$$meta.$$multiple === true ) {
                    return true;
                } else if( attr.$$meta.$$mandatory === false ) {
                    if( !_.any(attributes,
                        function (a) {
                            return a.name === attr.name;
                        })) {
                        return true;
                    }
                }
                return false;
            });
        };

        var addAttributeAfterType = function(attr, after) {
            var result = [];
            var found = false;

            _.each(this, function(next){
                result.push(next);
                if (found === false && next.name === after.name) {
                    result.push({name:attr.name, value:attr.value});
                    found = true;
                }
            });

            return result;
        };

        var removeNullAttributes = function() {
            var filtered = _.filter(this, function(attr) {
                var allowedEmpty = _.includes(allowedEmptyAttrs, attr.name);
                if(allowedEmpty) {
                    return true;
                }
                return attr.value;
            });

            return _.map(filtered, function(item) {
               if(_.isUndefined(item.value)) {
                   item.value = '';
               }
                return item;
            });

        };

        var toPlaintext = function() {
            var result = '';
            _.each(this, function (attr) {
                result += attr.name + ':' + _repeat(' ', Math.max(0, (20 - attr.name.length))) + _.trim( attr.value) + '\n';
            });
            return result;
        };

        var _repeat = function(string, n) {
            return new Array(n + 1).join(string);
        };

        function attributeWithNameExists(attrs, attributeName) {
            return _.any(attrs, function (attribute) {
                return attribute.name === attributeName;
            });
        }

        var getMissingMandatoryAttributes = function(objectType) {
            var missingAttrs = [];
            var self = this;
            _.each(WhoisMetaService.getMandatoryAttributesOnObjectType(objectType), function(item) {
                if( ! attributeWithNameExists(self, item.name) ) {
                    missingAttrs.push(item);
                }
            });
            return missingAttrs;
        };

        function getFirstMandatoryAttrAbove(objectType, attrTypeName) {
            var metaAttrs =  WhoisMetaService.getMandatoryAttributesOnObjectType(objectType);
            var idx = _.findIndex(metaAttrs, function(item) {
                return item.name === attrTypeName;
            });
            return metaAttrs[Math.max(0, idx-1)].name;
        }

        function addBelowLastOf( attrs, attrTypeName, item) {
            var last =  _.last(_.filter(attrs,
                function (attr) {
                    return attr.name === attrTypeName;
             }));

            var result = [];
            _.each(attrs, function(next){
                result.push(next);
                 if (next.name === last.name && next.value === last.value) {
                    result.push(item);
                }
            });
            return result;
        }

        var addMissingMandatoryAttribute = function(objectType, attr) {
            return addBelowLastOf(this, getFirstMandatoryAttrAbove(objectType, attr.name), attr);
        };

        this.wrapAttributes  = function( attrs ) {
            if ( !attrs ) {
                return [];
            }
            attrs.toString = toString;
            attrs.toPlaintext = toPlaintext;
            attrs.getAllAttributesOnName = getAllAttributesOnName;
            attrs.getAllAttributesNotOnName = getAllAttributesNotOnName;
            attrs.getAllAttributesWithValueOnName = getAllAttributesWithValueOnName;
            attrs.getSingleAttributeOnName = getSingleAttributeOnName;
            attrs.setSingleAttributeOnName = setSingleAttributeOnName;
            attrs.addAttrsSorted = addAttrsSorted;
            attrs.validate = validate;
            attrs.validateWithoutSettingErrors = validateWithoutSettingErrors;
            attrs.clearErrors = clearErrors;
            attrs.getAddableAttributes = getAddableAttributes;

            attrs.removeAttributeWithType = removeAttributeWithType;
            attrs.removeAttributeWithName = removeAttributeWithName; // mutates array
            attrs.removeAttribute = removeAttribute;
            attrs.duplicateAttribute = duplicateAttribute;
            attrs.canAttributeBeDuplicated = canAttributeBeDuplicated;
            attrs.canAttributeBeRemoved = canAttributeBeRemoved;
            attrs.addAttributeAfter = addAttributeAfter;
            attrs.addAttributeAfterType = addAttributeAfterType;
            attrs.removeNullAttributes = removeNullAttributes;
            attrs.getMissingMandatoryAttributes = getMissingMandatoryAttributes;
            attrs.addMissingMandatoryAttribute = addMissingMandatoryAttribute;
            return attrs;
        };

        this.wrap = function(whoisResources) {
            var result = whoisResources;
            if(!_.isUndefined(whoisResources) && isValidWhoisResources(whoisResources)) {
                var wrapped = this.wrapWhoisResources(whoisResources);
                var objectType = wrapped.getObjectType();
                if (!_.isUndefined(objectType) && !_.isUndefined(wrapped.getAttributes())) {
                    wrapped.objects.object[0].attributes.attribute =
                        this.wrapAttributes(
                            this.enrichAttributesWithMetaInfo(objectType, wrapped.getAttributes())
                        );
                }
                result = wrapped;
            }
            return result;
        };

        this.wrapSuccess = function(whoisResources) {
            return this.wrap(whoisResources);
        };

        this.wrapError = function(error) {
            var whoisResources;

            if (error) {
                if (error.data) {
                    whoisResources = error.data;
                } else if (error.config && error.config.data) {
                    whoisResources = error.config.data;
                }
            } else {
                error = {};
            }

            if (!isValidWhoisResources(whoisResources)) {
                whoisResources = {};
                whoisResources.errormessages = {};
                whoisResources.errormessages.errormessage = [];
                whoisResources.errormessages.errormessage.push(
                    {severity: 'Error', text: 'Unexpected error: please retry later'}
                );
            }

            error.data = this.wrap(whoisResources);

            return error;
        };

    }]);

