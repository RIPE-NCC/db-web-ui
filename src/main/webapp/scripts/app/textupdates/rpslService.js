'use strict';

angular.module('textUpdates')
    .service('RpslService', ['$log', function ($log) {
        var TOTAL_ATTR_LENGTH = 15;

        this.toRpsl = function (attributes) {
            var rpslData = '';
            _.each(attributes, function (item) {
                rpslData = rpslData.concat(_.padRight(item.name + ':', TOTAL_ATTR_LENGTH, ' '));
                if (!_.isUndefined(item.value)) {
                    rpslData = rpslData.concat(item.value);
                }
                if (!_.isUndefined(item.comment)) {
                    rpslData = rpslData.concat(' # ' + item.comment);
                }
                rpslData = rpslData.concat('\n');
            });
            return rpslData;
        };

        this.fromRpsl = function (rpslText) {
            var rawAttributes = _chopInParts(rpslText);

            var jsonAttributes = [];
            _.each(rawAttributes, function (rawAttribute) {
                var key = undefined;
                var value = '';
                var comment = '';

                var keyWithRest = rawAttribute.split(':');
                if (keyWithRest.length > 0 && !_.isEmpty(_.trim(keyWithRest[0]))) {
                    key = _.trim(keyWithRest[0]);

                    if (keyWithRest.length > 1) {
                        _.each(keyWithRest[1].split('\n'), function (item) {
                            var trimmed = _.trimRight(item);

                            if (trimmed.indexOf('#') < 0) {
                                // no comment
                                value = value.concat(trimmed);
                            } else if (_.startsWith(trimmed, '#')) {
                                // only comment
                                comment = comment.concat(trimmed.substring(1));
                            } else {
                                var valueWithRest = trimmed.split('#');
                                value = value.concat(valueWithRest[0]);
                                comment = comment.concat(valueWithRest[1]);
                            }
                        });
                    }

                    jsonAttributes.push({
                        name: key,
                        value: _noEmptyValues(value),
                        comment: _noEmptyValues(comment)
                    });
                }
            });
            return jsonAttributes;
        };


        function _chopInParts(rpslText) {
            var records = [];

            var record = '';
            for (var idx = 0; idx < rpslText.length; idx++) {
                var current = rpslText.charAt(idx);
                var next = rpslText.charAt(idx + 1);

                record += current;

                // newline followed by alpha-numeric character is attribute separator
                if (idx === rpslText.length - 1 || (current === '\n' && _isLetter(next))) {
                    // end of attribute reached
                    records.push(_.cloneDeep(record));
                    record = '';
                }
            }
            return records;
        }

        function _isLetter(c) {
            if (c === '') {
                return false;
            }
            return c.toLowerCase() != c.toUpperCase();
        }

        function _noEmptyValues(value) {
            if (_.isUndefined(value)) {
                return undefined;
            }
            var trimmed = _.trim(value);
            if (_.isEmpty(trimmed)) {
                return undefined;
            }
            return trimmed;
        }

    }]);

