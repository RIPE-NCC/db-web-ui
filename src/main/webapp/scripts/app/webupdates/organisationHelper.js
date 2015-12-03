/*global window: false */

'use strict';

angular.module('dbWebApp')
    .service('OrganisationHelper', ['WhoisResources', function (WhoisResources) {

        this.containsAbuseC = function (attributes) {
            var abuseC = _.find(attributes, function(attr) {
                return attr.name === 'abuse-c';
            });

            if(abuseC) {
                return !_.isEmpty(_.trim(abuseC.value));
            } else {
                return false;
            };
        }


        this.addAbuseC = function (objectType, attributes) {
            if(objectType == 'organisation') {
                attributes = WhoisResources.wrapAndEnrichAttributes(objectType, attributes);

                var attrs = attributes.addAttributeAfter({name:'abuse-c', value:''}, attributes.getSingleAttributeOnName('e-mail'));
                return WhoisResources.wrapAndEnrichAttributes(objectType, attrs);
            } else {
                return attributes;
            }
        }

    }]);
