/*global angular*/

(function () {
    'use strict';

    angular.module('textUpdates').service('SerialExecutor', ['$q', '$log', function ($q, $log) {

        this.execute = function (data, cb) {
            // package function and function argument
            var tasks = _.map(data, function (item) {
                return function () {
                    return cb(item);
                };
            });

            serial(tasks);
        };

        function serial(tasks) {
            if (tasks.length === 0) {
                // return right away
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }

            var callWrapper = function (index, deferred) {
                $log.info('Start processing task ' + (index + 1) + ' of ' + tasks.length);
                tasks[index]().then(
                    function () {
                        $log.info('Success performing task ' + (index + 1) + ' of ' + tasks.length);
                        var nextIndex = index + 1;
                        if (nextIndex < tasks.length) {
                            callWrapper(nextIndex, deferred);
                        } else {
                            $log.info('All tasks processed');
                            deferred.resolve();
                        }
                    }, function () {
                        $log.error('Error performing task ' + (index + 1) + ' of ' + tasks.length);
                        // go on in case of error
                        var nextIndex = index + 1;
                        if (nextIndex < tasks.length) {
                            callWrapper(nextIndex, deferred);
                        } else {
                            $log.info('All tasks processed');
                            deferred.resolve();
                        }
                    });

                return deferred.promise;
            };
            return callWrapper(0, $q.defer());
        }
    }]);
})();
