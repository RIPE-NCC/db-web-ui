'use strict';

angular.module('dbWebApp')
    .service('EnumService', ['CountryCodes', 'LanguageCodes', 'ResourceStatus', function (CountryCodes, LanguageCodes, ResourceStatus) {

        this.get = function (objectType, attrName) {
            var parentStatus = '';
            if (attrName === 'status') {
                // States are constrained by the parent
                return ResourceStatus.get(objectType, parentStatus);
            } else if (attrName === 'language') {
                return LanguageCodes.get();
            } else if (attrName === 'country') {
                return CountryCodes.get();
            }
        }
        
    }]);
