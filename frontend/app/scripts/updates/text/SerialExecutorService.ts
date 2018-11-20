class SerialExecutorService {
    public static $inject = ["$q", "$log"];

    constructor(private $q: ng.IQService,
                private $log: angular.ILogService) {

    }

    public execute(data: any, cb: any) {
        // package function and function argument
        const tasks = _.map(data, (item) => {
            return () => {
                return cb(item);
            };
        });

        this.serial(tasks);
    }

    private serial(tasks: any) {
        if (tasks.length === 0) {
            // return right away
            const deferred = this.$q.defer();
            deferred.resolve();
            return deferred.promise;
        }

        const callWrapper = (index: number, deferred: any) => {
            this.$log.info("Start processing task " + (index + 1) + " of " + tasks.length);
            tasks[index]().then(() => {
                    this.$log.info("Success performing task " + (index + 1) + " of " + tasks.length);
                    const nextIndex = index + 1;
                    if (nextIndex < tasks.length) {
                        callWrapper(nextIndex, deferred);
                    } else {
                        this.$log.info("All tasks processed");
                        deferred.resolve();
                    }
                }, () => {
                    this.$log.error("Error performing task " + (index + 1) + " of " + tasks.length);
                    // go on in case of error
                    const nextIndex = index + 1;
                    if (nextIndex < tasks.length) {
                        callWrapper(nextIndex, deferred);
                    } else {
                        this.$log.info("All tasks processed");
                        deferred.resolve();
                    }
                });

            return deferred.promise;
        };
        return callWrapper(0, this.$q.defer());
    }
}
angular.module("textUpdates")
    .service("SerialExecutorService", SerialExecutorService);
