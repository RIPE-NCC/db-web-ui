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
                rpslData = rpslData.concat('\n');
            });
            return rpslData;
        };

        this.fromRpsl = function (rpslText) {
            var attrs = [];
            _.each(rpslText.split('\n'), function (item) {
                var splitted = item.split(':');
                if (splitted.length > 0 && !_.isUndefined(splitted[0]) && !_.isEmpty(_.trim(splitted[0]))) {
                    var valueWithComment = undefined;
                    if (!_.isUndefined(splitted[1]) && !_.isEmpty(_.trim(splitted[1]))) {
                        valueWithComment = _.trim(splitted[1]);
                    }
                    attrs.push({name: _.trim(splitted[0]), value: valueWithComment});
                }
            });
            return attrs;
        };

    }]);

