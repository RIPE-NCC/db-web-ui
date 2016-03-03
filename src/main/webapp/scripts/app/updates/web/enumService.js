'use strict';

angular.module('dbWebApp')
    .service('EnumService', ['CountryCodes', 'LanguageCodes', 'ResourceStatus', function (CountryCodes, LanguageCodes, ResourceStatus) {

        this.get = function (objectType, attrName) {
            if (attrName === 'status') {
                return ResourceStatus.get(objectType, attrName);
            } else if (attrName === 'language') {
                return LanguageCodes.get();
            } else if (attrName === 'country') {
                return CountryCodes.get();
            }
        }


    }]);
