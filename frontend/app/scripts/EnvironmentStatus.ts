// Only temporary, until we are shouldn't provide all features on test, rc and training environment
class EnvironmentStatus {

    public static $inject = ["$location"];

    constructor(private $location: ng.ILocationService) {
    }

    public isTrainingEnv(): boolean {
        const host = this.$location.host();
        return host.indexOf("training.db.ripe.net") === 0;
    }

    public isTestRcEnv(): boolean {
        const host = this.$location.host();
        return host.indexOf("apps-test.db.ripe.net") === 0
            || host.indexOf("rc.db.ripe.net") === 0;
    }
}

angular.module("dbWebApp").service("EnvironmentStatus", EnvironmentStatus);
