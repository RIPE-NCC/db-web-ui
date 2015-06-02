'use strict';

angular.module('dbWebApp')
    .service('WhoisResourcesUtil', function () {

        this.embedAttributes = function( attrs ) {
            return {
                objects:{
                    object: [
                        { attributes: { attribute: attrs } }
                    ]
                }
            }
        };

        this.readableError = function( errorMessage ) {
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

        this.getGlobalErrors = function (whoisResources) {
            if( !whoisResources.errormessages ) {
                return [];
            }
            var self = this;
            return whoisResources.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = self.readableError(errorMessage);
                    return errorMessage.severity === 'Error' && !errorMessage.attribute;
                });
        };

        this.getGlobalWarnings = function (whoisResources) {
            if( !whoisResources.errormessages ) {
                return [];
            }
            var self = this;
            return whoisResources.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = self.readableError(errorMessage);
                    return errorMessage.severity === 'Warning' && !errorMessage.attribute;
                });
        };

        this.getGlobalInfos = function (whoisResources) {
            if( !whoisResources.errormessages ) {
                return [];
            }
            var self = this;
            return whoisResources.errormessages.errormessage.filter(
                function (errorMessage) {
                    errorMessage.plainText = self.readableError(errorMessage);
                    return errorMessage.severity === 'Info' && !errorMessage.attribute;
                });
        };

        this.getErrorsOnAttribute = function (whoisResources, attributeName) {
            if( !whoisResources.errormessages ) {
                return [];
            }
            var self = this;
            return whoisResources.errormessages.errormessage.filter(
                function (errorMessage) {
                    if (errorMessage.attribute) {
                        errorMessage.plainText = self.readableError(errorMessage);
                        return errorMessage.attribute.name === attributeName;
                    }
                    return false;
                });
        };

        this.getObjectUid = function (whoisResources) {
            if( !whoisResources.objects ) {
                return undefined;
            }
            return whoisResources.objects.object[0]['primary-key'].attribute[0].value;
        };

        this.getAttributes = function (whoisResources) {
            if( !whoisResources.objects ) {
                return [];
            }
            return whoisResources.objects.object[0].attributes.attribute;
        };

        this.getSingleAttributeOnName = function (attrs, name) {
            if( attrs ) {
                return undefined;
            }
            return _.find(attrs,  function (attr) {
                return attr.name === name;
            });
        };

        this.getAllAttributesOnName = function (attrs, attributeName) {
            return attrs.attribute.filter(
                function (attribute) {
                    return attribute.name === attributeName;
                });
        };

        this.setAttribute = function (attrs, name, value) {
            return _.map(attrs, function(attr) {
                if( attr.name === name ) {
                    attr.value = value;
                }
                return attr;
            });
        };

        this.addAttributeValueOnName = function (whoisResources, attributeName, attributeValue) {
            whoisResources.objects.object[0].attributes.attribute.push({
                'name': attributeName,
                'value': attributeValue
            });
        };

        this.getObjectType = function (whoisResources) {
            return whoisResources.objects.object[0].type;
        };

        this.setObjectType = function (whoisResources, objectType) {
            whoisResources.objects.object[0].type = objectType;
        };

    });

