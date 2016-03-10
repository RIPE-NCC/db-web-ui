'use strict';

angular.module('textUpdates')
    .service('SerialExecutor', ['$q','$log', function ($q, $log) {

        this.execute = function(data, cb) {
            // package function and function argument
            var tasks = _.map(data, function(item) {
                return function() {
                    return cb(item);
                };
            });

            _serial(tasks);
        }

        function _serial(tasks) {
            if (tasks.length === 0) {
                // return right away
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }

            var callWrapper = function(index, deferred) {
                $log.info("Processing task " + (index+1) + " of " + tasks.length);
                tasks[index]().then(function() {
                    var nextIndex = index + 1;
                    if (nextIndex < tasks.length) {
                        callWrapper(nextIndex, deferred);
                    } else {
                        $log.info("All tasks processed");
                        deferred.resolve();
                    }
                });

                return deferred.promise;
            };
            return callWrapper(0, $q.defer());
        };
    }]);

