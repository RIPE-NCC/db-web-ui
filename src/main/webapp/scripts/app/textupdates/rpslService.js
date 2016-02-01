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
                if((_.isUndefined(f.value) || _.isEmpty(f.value)) || f.value == 'AUTO-1') {
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

        this.fromRpsl = function(rpslText) {
            return this.fromRpslWithPasswords(rpslText, [], []);
        }

        this.fromRpslWithPasswords = function(rpslText, passwords, overrides) {
            var objs = [];

            _.each(rpslText.split('\n\n'), function(objRpsl) {
                if( objRpsl !== '') {
                    objs.push(_parseSingleObject(objRpsl,passwords, overrides ));
                }
            });

            passwords = _stripDuplicates(passwords);
            overrides = _stripDuplicates(overrides);

            return objs;
        }

        function _stripDuplicates( array ) {
            var uniqued = _.unique(_.clone(array));
            // don't copy into a new pointer, but leave existibg pointer in tact
            while (array.length) {
                array.pop();
            }
            _.each(uniqued, function(item) {
                array.push(item);
            });
        }

        function _parseSingleObject( rpslText, passwords, overrides ) {
            var attrs = [];

            var buffer = '';
            for (var idx = 0; idx < rpslText.length; idx++) {
                var current = rpslText.charAt(idx);
                var next = rpslText.charAt(idx + 1);

                buffer += current;

                // newline followed by alpha-numeric character is attribute separator
                if (idx === rpslText.length - 1 || (current === '\n' && _isLetter(next))) {
                    // end of attribute reached
                    var attr = _parseSingleAttribute(_.clone(buffer));
                    if(!_.isUndefined(attr)) {
                        var trimmed = _.trim(attr.value);
                        if( attr.name === 'password' && !_.isEmpty(trimmed)) {
                            passwords.push(trimmed);
                        } else  if( attr.name === 'override'  && !_.isEmpty(trimmed)) {
                            overrides.push(trimmed);
                        } else {
                            attrs.push(attr);
                        }
                    }
                    // reset buffer
                    buffer = '';
                }
            }

            return attrs;
        }

        function _parseSingleAttribute( rawAttribute ) {
            var attr = undefined;

            // extract the key
            var keyWithRest = rawAttribute.split(':');
            if (keyWithRest.length > 0 && !_.isEmpty(_.trim(keyWithRest[0]))) {
                var key = _.trim(_.head(keyWithRest));
                var rest = _.tail(keyWithRest).join(':'); // allow colons in value
                var values = [];
                var comments = [];

                // extract the value and comment
                if (keyWithRest.length > 1) {
                    _.each(rest.split('\n'), function (item) {
                        var trimmed = _.trim(item);

                        if( !_.isEmpty(trimmed)) {
                            if (item.indexOf('#') < 0) { // no comment
                                // keep left spacing for value
                                values.push(_.trimRight(item));
                            } else if (_.startsWith(trimmed, '#')) { // only comment
                                // trim comment
                                comments.push(_.trim(trimmed.substring(1)));
                            } else { // both value and comment
                                var valueWithComment = item.split('#');
                                // keep left spacing for value
                                values.push(_.trimRight(valueWithComment[0]));
                                // trim comment
                                comments.push(_.trim(valueWithComment[1]));
                            }
                        }
                    });
                }

                attr = {
                    name: key,
                    value: _undefinedForEmpty(_concatenate(values,"")),
                    comment: _undefinedForEmpty(_concatenate(comments, " "))
                };
            }
            return attr;
        }

        function _concatenate(array, separator) {
            return _.reduce(array, function (combined, item) {
                if (!_.isUndefined(item)) {
                    return combined + separator + item;
                }
            });
        }

        function _isLetter(c) {
            if (_.isEmpty(c)) {
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

