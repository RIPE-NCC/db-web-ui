'use strict';

angular.module('updates')
    .service('CharsetTools', ['$log', function ($log) {

        this.isLatin1 = function (value) {
            if(_.isUndefined(value) || _.isEmpty(value)) {
                return true;
            }
            try {
                var fixedstring = decodeURIComponent(escape(value));
                if( fixedstring !== value) {
                    return false;
                }
                return true;
            } catch(exc) {
                return false;
            }
        }

    }]);
