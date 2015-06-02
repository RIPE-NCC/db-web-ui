'use strict';

angular.module('dbWebApp')
    .service('WhoisResourcesUtil', function () {

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
            if( !this.errormessages ) {
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
            if( !this.errormessages ) {
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
            if( !this.errormessages ) {
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
            if( !this.errormessages ) {
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
            if( !this.objects ) {
                return undefined;
            }
            return this.objects.object[0]['primary-key'].attribute[0].value;
        };

        var getAttributes = function () {
            if( !this.objects ) {
                return [];
            }
            return this.objects.object[0].attributes.attribute;
        };

        this.embedAttributes = function( attrs ) {
            return{
                objects:{
                    object: [
                        { attributes: { attribute: attrs } }
                    ]
                }
            };
        };

        this.wrapWhoisResources  = function( whoisResources ) {
            if ( !whoisResources ) {
                return undefined;
            }
            whoisResources.toString = toString;
            whoisResources.readableError = readableError;
            whoisResources.getGlobalErrors = getGlobalErrors;
            whoisResources.getGlobalWarnings = getGlobalWarnings;
            whoisResources.getGlobalInfos = getGlobalInfos;
            whoisResources.getErrorsOnAttribute = getErrorsOnAttribute;
            whoisResources.getAttributes = getAttributes;
            whoisResources.getObjectUid = getObjectUid;

            return whoisResources;
        };

        var getSingleAttributeOnName = function (name) {
            return _.find(this,  function (attr) {
                return attr.name === name;
            });
        };

       var getAllAttributesOnName = function (attributeName) {
            return _.filter(this,
                function (attribute) {
                    return attribute.name === attributeName;
                });
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

        var toString = function() {
            return JSON.stringify(this);
        };

        this.wrapAttributes  = function( attrs ) {
            if ( !attrs ) {
                return [];
            }
            attrs.toString = toString;
            attrs.getAllAttributesOnName = getAllAttributesOnName;
            attrs.getSingleAttributeOnName = getSingleAttributeOnName;
            attrs.setSingleAttributeOnName = setSingleAttributeOnName;

            return attrs;
        };


    });

