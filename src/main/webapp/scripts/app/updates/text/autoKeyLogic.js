/*global angular*/

(function () {
    'use strict';

    angular.module('textUpdates').service('AutoKeyLogic', ['$log', function ($log) {

        var autoKeyMap = {};

        this.log = function (msg) {
            $log.info(msg + ':' + JSON.stringify(autoKeyMap));
        };

        this.identifyAutoKeys = function (objectType, attrs) {
            _.each(attrs, function (attr) {
                var trimmedValue = _.trim(attr.value);
                if (_.startsWith(trimmedValue, 'AUTO-')) {
                    var key = objectType + '.' + _.trim(attr.name);
                    var autoMeta = autoKeyMap[trimmedValue];
                    if (_.isUndefined(autoMeta)) {
                        autoKeyMap[trimmedValue] = {provider: key, consumers: [], value: undefined};
                        $log.debug('Identified new auto-key provider ' + trimmedValue + '->' + JSON.stringify(autoKeyMap[trimmedValue]));
                    } else {
                        autoMeta.consumers.push(key);
                        $log.debug('Identified existing auto-key consumer ' + trimmedValue + '->' + JSON.stringify(autoMeta));
                    }
                }
            });
        };

        this.get = function () {
            return autoKeyMap;
        };

        this.clear = function () {
            autoKeyMap = {};
        };

        this.registerAutoKeyValue = function (autoAttr, afterCreateAttrs) {
            var trimmedValue = _.trim(autoAttr.value);

            _.each(afterCreateAttrs, function (after) {
                if (autoAttr.name === after.name) {
                    var autoMeta = autoKeyMap[trimmedValue];
                    if (!_.isUndefined(autoMeta)) {
                        autoMeta.value = after.value;
                        $log.debug('Register ' + autoAttr.name + ' with auto-key ' + autoAttr.value + ' to ' + autoMeta.value);
                    } else {
                        $log.debug('Auto key ' + autoAttr.value + ' not found in ' + JSON.stringify(autoKeyMap));
                    }
                }
            });
        };

        this.substituteAutoKeys = function (attrs) {
            _.each(attrs, function (attr) {
                var trimmedValue = _.trim(attr.value);
                if (_.startsWith(trimmedValue, 'AUTO-')) {
                    var autoMeta = autoKeyMap[trimmedValue];
                    if (!_.isUndefined(autoMeta) && !_.isUndefined(autoMeta.value)) {
                        $log.debug('Substituting ' + trimmedValue + ' with ' + autoMeta.value);
                        attr.value = autoMeta.value;
                    }
                }
            });
            return attrs;
        };

        this.getAutoKeys = function (attributes) {
            var attrs = _.filter(attributes, function (attr) {
                return _.startsWith(_.trim(attr.value), 'AUTO-');
            });
            return attrs;
        };

    }]);

})();
