class MailSentCtrl {

    public static $inject = ["$scope", "$stateParams"];
// TODO REMOVE ANY AND MAYBE STORE EMAIL IN THIS SERVICE
    constructor($scope: any, $stateParams: any) {
        $scope.email = $stateParams.email;
    }
}

angular.module("fmp").controller("MailSentCtrl", MailSentCtrl);
