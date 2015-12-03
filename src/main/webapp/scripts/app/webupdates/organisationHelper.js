/*global window: false */

'use strict';

angular.module('dbWebApp')
    .service('OrganisationHelper', [function () {

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

    }]);
