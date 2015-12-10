/*global window: false */

'use strict';

angular.module('dbWebApp')

    .service('OrganisationHelper', ['WhoisResources', 'RestService', function (WhoisResources, RestService) {


        this.validateAbuseC = function(objectType, attributes) {
            if(objectType === 'organisation') {
                return this.containsAbuseC(attributes);
            } else {
                return true;
            }
        };

        this.containsAbuseC = function (attributes) {
            var abuseC = _.find(attributes, function(attr) {
                return attr.name === 'abuse-c';
            });

            if(abuseC) {
                return !_.isEmpty(_.trim(abuseC.value));
            } else {
                return false;
            }
        };


        this.addAbuseC = function (objectType, attributes) {
            if(objectType === 'organisation') {
                attributes = WhoisResources.wrapAndEnrichAttributes(objectType, attributes);

                var attrs = attributes.addAttributeAfter({name:'abuse-c', value:''}, attributes.getSingleAttributeOnName('e-mail'));
                return WhoisResources.wrapAndEnrichAttributes(objectType, attrs);
            } else {
                return attributes;
            }
        };

        this.updateAbuseC = function (source, objectType, roleForAbuseC, organisationAttributes, passwords) {
            if(objectType === 'organisation' && roleForAbuseC) {

                roleForAbuseC = WhoisResources.wrapAttributes(roleForAbuseC);
                _.forEach(roleForAbuseC.getAllAttributesOnName('mnt-by'), function(mnt) {
                    roleForAbuseC = roleForAbuseC.removeAttribute(mnt);
                    roleForAbuseC = WhoisResources.wrapAttributes(roleForAbuseC); //I really don't know when to use the wrappers! ;(
                });

                roleForAbuseC = WhoisResources.wrapAttributes(roleForAbuseC);
                _.forEach(organisationAttributes.getAllAttributesOnName('mnt-by'), function(mnt) {
                    roleForAbuseC = roleForAbuseC.addAttributeAfterType({name: 'mnt-by', value: mnt.value}, {name: 'nic-hdl'});
                    roleForAbuseC = WhoisResources.wrapAttributes(roleForAbuseC);
                });

                roleForAbuseC.setSingleAttributeOnName('address', organisationAttributes.getSingleAttributeOnName('address').value);

                RestService.modifyObject(source, 'role', roleForAbuseC.getSingleAttributeOnName('nic-hdl').value,
                    WhoisResources.turnAttrsIntoWhoisObject(roleForAbuseC), passwords).then(
                    function() {},
                    function() {});
            }
        };

    }]);
