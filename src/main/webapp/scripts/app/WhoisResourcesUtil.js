'use strict';

angular.module('dbWebApp')
    .service('WhoisResourcesUtil', function () {

        this.getGlobalErrors = function (whoisResources) {
            if( whoisResources.errormessages == null ) {
                return [];
            }
            return whoisResources.errormessages.errormessage.filter(
                function (errorMessage) {
                    //errorMessage.msg = errorMessage.text.format(errorMessage.args);
                    return errorMessage.severity == 'Error' && errorMessage.attribute == null
                });
        };

        this.getGlobalWarnings = function (whoisResources) {
            if( whoisResources.errormessages == null ) {
                return [];
            }
            return whoisResources.errormessages.errormessage.filter(
                function (errorMessage) {
                    //errorMessage.msg = errorMessage.text.format(errorMessage.args);
                    return errorMessage.severity == 'Warning' && errorMessage.attribute == null
                });
        };

        this.getErrorsOnAttribute = function (whoisResources, attributeName) {
            if( whoisResources.errormessages == null ) {
                return [];
            }
            return whoisResources.errormessages.errormessage.filter(
                function (errorMessage) {
                    //errorMessage.msg = errorMessage.text.format(errorMessage.args);
                    if (errorMessage.attribute != null) {
                        return errorMessage.attribute.name == attributeName;
                    }
                    return false;
                });
        };

        this.getObjectUid = function (whoisResources) {
            if( whoisResources.objects == null ) {
                return null;
            }
            return whoisResources.objects.object[0]['primary-key'].attribute[0].value;
        };

        this.getAttributes = function (whoisResources) {
            if( whoisResources.objects == null ) {
                return [];
            }
            return whoisResources.objects.object[0].attributes.attribute;
        };

        this.getSingleAttributeOnName = function (whoisResources, attributeName) {
            if( whoisResources.objects  || whoisResources.objects.object[0] ) {
                return {};
            }
            attributes = whoisResources.objects.object[0].attributes.attribute.filter(
                function (attribute) {
                    return attribute.name == attributeName
                });
            if (attributes == null || attributes.length == 0) {
                return null;
            }
            return attributes[0];
        };

        this.getAllAttributesOnName = function (whoisResources, attributeName) {
            return whoisResources.objects.object[0].attributes.attribute.filter(
                function (attribute) {
                    return attribute.name == attributeName
                });
        };

        this.setAttributeValueOnName = function (whoisResources, attributeName, attributeValue) {
            attribute = getSingleAttributeOnName(whoisResources, attributeName);
            if (attributes != null) {
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

