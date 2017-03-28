interface IWhoisObjectControllerScope extends angular.IScope {
    attributes: IAttributeModel[],
    objectName: string;
    objectSource: string;
    objectType: string;
}

class WhoisObjectController {
    public static $inject = ["$log", "$scope"];
    public objectName: string;
    public objectSource: string;
    public objectType: string;
    public attributes: IAttributeModel[];

    constructor(private $log: angular.ILogService,
                private $scope: IWhoisObjectControllerScope) {
        // $log.info("name", $scope.objectName);
        // $log.info("type", $scope.objectType);
        // $log.info("sauce", $scope.objectSource);
        $log.info("attributes", $scope.attributes);

        this.objectName = $scope.objectName;
        this.objectSource = $scope.objectSource;
        this.objectType = $scope.objectType;
        this.attributes = $scope.attributes;
    }

}

angular
    .module("dbWebApp")
    .controller("WhoisObjectController", WhoisObjectController);
