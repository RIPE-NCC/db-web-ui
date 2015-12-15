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
            var attrs = [];
            _.each(rpslText.split('\n'), function (item) {
                var splitted = item.split(':');
                if (splitted.length > 0 && !_.isUndefined(splitted[0]) && !_.isEmpty(_.trim(splitted[0]))) {
                    var key = _.trim(splitted[0]);

                    var value = undefined;
                    var comment = undefined;
                    if (!_.isUndefined(splitted[1]) && !_.isEmpty(_.trim(splitted[1]))) {
                        var valueSpiltted = splitted[1].split('#');

                        if (!_.isUndefined(valueSpiltted[0]) && !_.isEmpty(_.trim(valueSpiltted[0]))) {
                            value = _.trim(valueSpiltted[0]);
                        }
                        if (!_.isUndefined(valueSpiltted[1]) && !_.isEmpty(_.trim(valueSpiltted[1]))) {
                            comment = _.trim(valueSpiltted[1]);
                        }
                    }
                    attrs.push({name: key, value: value, comment:comment});
                }
            });
            return attrs;
        };

    }]);

