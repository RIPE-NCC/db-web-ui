'use strict';

angular.module('textUpdates')
    .service('RpslService', ['$log', function ($log) {
        var TOTAL_ATTR_LENGTH = 15;

        this.toRpsl = function (attributes) {
            var spacing = 0;

            // If the first attribute of an object has no value, we are composing a new template.
            // In tghis case we should using padding (max 15 spaces)
            // otherwise we will inherit existing formatting
            var f = _.first(attributes);
            if( !_.isUndefined(f)) {
                if(_.isUndefined(f.value) ) {
                    spacing = TOTAL_ATTR_LENGTH;
                }
            }

            var rpslData = '';
            _.each(attributes, function (item) {
                rpslData = rpslData.concat(_.padRight(item.name + ':', spacing, ' '));
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
                var values = [];
                var comments = [];

                var keyWithRest = rawAttribute.split(':');
                if (keyWithRest.length > 0 && !_.isEmpty(_.trim(keyWithRest[0]))) {
                    key = _.trim(keyWithRest[0]);

                    if (keyWithRest.length > 1) {

                        _.each(keyWithRest[1].split('\n'), function (item) {
                            var trimmed = _.trim(item);

                            if (item.indexOf('#') < 0) { // no comment
                                // keep spacing for value
                                values.push(item);
                            } else if (_.startsWith(trimmed, '#')) { // only comment
                                // trim comment
                                comments.push(_.trim(trimmed.substring(1)));
                            } else { // both value and comment
                                var valueWithComment = item.split('#');
                                // keep spacing for value
                                values.push(valueWithComment[0]);
                                // trim comment
                                comments.push(_.trim(valueWithComment[1]));
                            }
                        });
                    }

                    jsonAttributes.push({
                        name: key,
                        value: _undefinedForEmpty(_concatenateWithSpaces(values)),
                        comment: _undefinedForEmpty(_concatenateWithSpaces(comments))
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

                // newline followed by alpha-numeric character is attribute separator

                if (idx === rpslText.length - 1 || current === '\n' && _isLetter(next)) {
                    // end of attribute reached
                    records.push(_.clone(record));
                    record = '';
                } else {
                    record += current;
                }
            }

            // keep remainder

            return records;
        }

        function _concatenateWithSpaces(array) {
            var idx = 0;
            var all = '';
            _.each(array, function (item) {
                if (!_.isUndefined(item)) {
                    all = all.concat(item);
                    // no more space after last
                    if (idx < array.length - 1) {
                        all = all.concat(' ');
                    }
                }
                idx++;
            });
            return all;
        }

        function _isLetter(c) {
            if (c === '') {
                return false;
            }
            return c.toLowerCase() != c.toUpperCase();
        }

        function _undefinedForEmpty(value) {
            if (_.isUndefined(value) || _.isEmpty(_.trim(value))) {
                return undefined;
            }
            return value;
        }

    }]);

