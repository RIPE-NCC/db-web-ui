'use strict';

angular.module('dbWebApp')
    .service('WhoisResourcesUtil', function () {

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
                return null;
            }
            return whoisResources.objects.object[0]['primary-key'].attribute[0].value;
        };

        this.getAttributes = function (whoisResources) {
            if( !whoisResources.objects ) {
                return [];
            }
            return whoisResources.objects.object[0].attributes.attribute;
        };

        this.getSingleAttributeOnName = function (whoisResources, attributeName) {
            if( whoisResources.objects  || whoisResources.objects.object[0] ) {
                return {};
            }
            var attributes = whoisResources.objects.object[0].attributes.attribute.filter(
                function (attribute) {
                    return attribute.name === attributeName;
                });
            if (attributes === null || attributes.length === 0) {
                return null;
            }
            return attributes[0];
        };

        this.getAllAttributesOnName = function (whoisResources, attributeName) {
            return whoisResources.objects.object[0].attributes.attribute.filter(
                function (attribute) {
                    return attribute.name === attributeName;
                });
        };

        this.setAttributeValueOnName = function (whoisResources, attributeName, attributeValue) {
            var attributes = this.getSingleAttributeOnName(whoisResources, attributeName);
            if (attributes) {
                attributes[0].value = attributeValue;
            }
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

