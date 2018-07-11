// TODO keep mntnerKey and user inside of controller
class SsoAddedCtrl {
    public static $inject = ["$scope", "$stateParams"];

    constructor($scope: any, $stateParams: any) {
        $scope.mntnerKey = $stateParams.mntnerKey;
        $scope.user = $stateParams.user;
    }
}

angular.module("fmp")
    .controller("SsoAddedCtrl", ["$scope", "$stateParams", SsoAddedCtrl]);
