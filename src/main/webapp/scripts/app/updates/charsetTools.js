'use strict';

angular.module('updates')
    .service('CharsetTools', ['$log', function ($log) {

        this.isLatin1 = function (attribute) {
            try {
                var fixedstring = decodeURIComponent(escape(attribute.value));
                if( fixedstring !== attribute.value) {
                    return false;
                }
                return true;
            } catch(exc) {
                return false;
            }


        }

    }]);
