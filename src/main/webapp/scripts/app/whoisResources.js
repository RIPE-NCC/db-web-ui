'use strict';

angular.module('dbWebApp')
    .service('WhoisResources', function () {

        this.embedAttributes = function( attrs ) {
            return{
                objects:{
                    object: [
                        { attributes: { attribute: attrs } }
                    ]
                }
            };
        };

        var toString = function() {
            return JSON.stringify(this);
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

         var getGlobalWarnings = function () {
             if( ! this.errormessages ) {
                 return [];
             }
             var self = this;
            return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = self.readableError(errorMessage);
                    return errorMessage.severity === 'Warning' && !errorMessage.attribute;
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

        var getErrorsOnAttribute = function (attributeName) {
            if( ! this.errormessages ) {
                return [];
            }
            var self = this;
            return this.errormessages.errormessage.filter(
                function (errorMessage) {
                    if (errorMessage.attribute) {
                        errorMessage.plainText = self.readableError(errorMessage);
                        return errorMessage.attribute.name === attributeName;
                    }
                    return false;
                });
        };

        var getObjectUid = function () {
            if( ! this.objects ) {
                return undefined;
            }
            return this.objects.object[0]['primary-key'].attribute[0].value;
        };

        var getAttributes = function () {
            if( ! this.objects ) {
                return [];
            }
            return this.objects.object[0].attributes.attribute;
        };

        var isValidWhoisResources = function( whoisResources) {
            if( _.isUndefined(whoisResources) || _.isNull(whoisResources) ) {
                return false;
            }
            if( _.has(whoisResources,'objects' ) == false && _.has(whoisResources,'errormessages' ) == false ) {
                return false;
            }

            return true;
        };

        var objectNamesAsAttributes = function( attributeType) {
            return _.map(this.objects.object,  function (obj) {
                return { name: attributeType, value:obj['primary-key'].attribute[0].value };
            });
        };

        this.wrapWhoisResources  = function( whoisResources ) {
            if ( !  isValidWhoisResources(whoisResources) ) {
                return undefined;
            }
            // enrich data with methods
            whoisResources.toString = toString;
            whoisResources.readableError = readableError;
            whoisResources.getGlobalErrors = getGlobalErrors;
            whoisResources.getGlobalWarnings = getGlobalWarnings;
            whoisResources.getGlobalInfos = getGlobalInfos;
            whoisResources.getErrorsOnAttribute = getErrorsOnAttribute;
            whoisResources.getAttributes = getAttributes;
            whoisResources.getObjectUid = getObjectUid;
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

        var mergeSortAttributes = function (attrType, attrs) {
            // know the idnex of each kind of attributes in an object
            var objecTypeIndex = {};
            _.map(this, function(attr) {
                objecTypeIndex[attr.name] = attr.$$meta;
            });
            //console.log("field-index:" + JSON.stringify(objecTypeIndex));

            // apppend the two arrays
            var combined = this.concat(attrs);
            //console.log("combined:" + JSON.stringify(combined));

            // add meta to items without meta
            var enriched = _.map(combined, function(attr) {
                if( ! attr.$$meta ) {
                   attr.$$meta = objecTypeIndex[attr.name];
               }
                return attr;
            });
            //console.log("enriched:" + JSON.stringify(enriched));

            // add meta to items without meta
            var stripped = _.filter(enriched, function(attr) {
                if( attr.name === attrType && ! attr.value ) {
                    return false;
                }
                return true;
            });
            //console.log("stripped:" + JSON.stringify(stripped));

            var sorted = _.sortBy(stripped, function (attr) {
                return attr.$$meta.$$idx;
            })
            //console.log("sorted:" + JSON.stringify(sorted));
            return sorted;
        };

        var setSingleAttributeOnName = function( name, value) {
            var found = false;
             return _.map(this, function(attr) {
                if( attr.name === name && found == false) {
                    attr.value = value;
                    found = true
                }
                return attr;
            });
        };

        var validate = function() {
            var errorFound = false;
            var self = this;
            _.map(this, function (attr) {
                if (attr.$$meta.$$mandatory === true && ! attr.value && self.getAllAttributesWithValueOnName(attr.name).length == 0 ) {
                    attr.$$error = 'Mandatory attribute not set';
                    errorFound = true;
                } else {
                    attr.$$error = undefined;
                }
            });
            return errorFound === false;
        };

        var clearErrors = function() {
            _.map(this, function (attr) {
                attr.$$error = undefined;
            });
        };

        // TODO: every matching attribute will be removed (not just specified attribute)
        var removeAttribute = function(attr) {
            return _.filter(this, function(next) {
                return !(attr.name === next.name && attr.value === next.value);
            });
        };

        // TODO: every matching attribute will be duplicated (not just specified attribute)
        var duplicateAttribute = function(attr) {
            var result = [];

            _.each(this, function(next){
                result.push(next);
                if (next.name == attr.name && next.value == attr.value) {
                    result.push({name:attr.name});
                }
            });

            return result;
        };

        var canAttributeBeDuplicated = function( attr) {
                return attr.$$meta.$$multiple;
        };

        var canAttributeBeRemoved = function( attr) {
                return attr.$$meta.$$mandatory == false;
        };

        var addAttributeAfter = function(attr, after) {
            var result = [];

            _.each(this, function(next){
                result.push(next);
                if (next.name == after.name && next.value == after.value) {
                    result.push({name:attr.name});
                }
            });

            return result;
        }

        this.wrapAttributes  = function( attrs ) {
            if ( !attrs ) {
                return [];
            }
            attrs.toString = toString;
            attrs.getAllAttributesOnName = getAllAttributesOnName;
            attrs.getAllAttributesNotOnName = getAllAttributesNotOnName;
            attrs.getAllAttributesWithValueOnName = getAllAttributesWithValueOnName;
            attrs.getSingleAttributeOnName = getSingleAttributeOnName;
            attrs.setSingleAttributeOnName = setSingleAttributeOnName;
            attrs.mergeSortAttributes = mergeSortAttributes;
            attrs.validate = validate;
            attrs.clearErrors = clearErrors;

            attrs.removeAttribute = removeAttribute;
            attrs.duplicateAttribute = duplicateAttribute;
            attrs.canAttributeBeDuplicated = canAttributeBeDuplicated;
            attrs.canAttributeBeRemoved = canAttributeBeRemoved;
            attrs.addAttributeAfter = addAttributeAfter;

            return attrs;
        };


    });

