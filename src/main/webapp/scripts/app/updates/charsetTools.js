'use strict';

angular.module('updates')
    .service('CharsetTools', ['$log', function ($log) {

        this.isLatin1 = function (value) {
            if(_.isUndefined(value) || _.isEmpty(value)) {
                return true;
            }
            // escape encodes extended ISO-8859-1 characters (UTF code points U+0080-U+00ff) as %xx (two-digit hex)
            // whereas it encodes UTF codepoints U+0100 and above as %uxxxx (%u followed by four-digit hex.)
            return !_.contains(escape(value), "%u");
        }

    }]);
