'use strict';

angular.module('updates')
    .service('CharsetTools', ['$log', function ($log) {

        var substitutions  = [
            {code:'\u2013',sub:'-'}, // em dash
            {code:'\u2014',sub:'-'}, // en dash
            {code:'\u00A0',sub:' '} // nbsp
        ];

        this.isLatin1 = function (value) {
            if(_.isUndefined(value) || _.isEmpty(value)) {
                return true;
            }
            // escape encodes extended ISO-8859-1 characters (UTF code points U+0080-U+00ff) as %xx (two-digit hex)
            // whereas it encodes UTF codepoints U+0100 and above as %uxxxx (%u followed by four-digit hex.)
            return !_.contains(escape(value), "%u");
        }

        // compare string against array of substitutable values and replace if found
        this.substitute = function (value) {
            var subbedValue = value;

            // if we have this unicode char in the string we always want to replace it
            _.forEach(substitutions, function (sub) {
                var subbed = [];
                                                                     // g to replace all not just the first
                subbedValue = subbedValue.replace(new RegExp(sub.code, 'g'), function () {
                    subbed.push(sub);

                    $log.debug('Found match for substitution : ' + sub.code + ' > ' + sub.sub)
                    return sub.sub;
                });
            });
            return subbedValue;
        }

        this.replaceNonSubstitutables = function (value) {
            return value.replace(/[\u0100-\ue007]/g, '?');
        }


    }]);
