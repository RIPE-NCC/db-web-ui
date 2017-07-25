import IAngularEvent = angular.IAngularEvent;

class LeftMenuController {
    public static $inject = ["$rootScope", "$scope", "$state", "$location"];

    public activeUrl: string;
    public show: {
        admin: boolean;
        billing: boolean;
        certification: boolean;
        general: boolean;
        generalMeeting: boolean;
        myResources: boolean;
        ticketing: boolean;
        // Only temporary for the test environment
        testTrainingEnv: boolean;
    } = {
        admin: false,
        billing: false,
        certification: false,
        general: false,
        generalMeeting: false,
        myResources: false,
        ticketing: false,
        testTrainingEnv: false,
    };

    constructor(private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private $state: ng.ui.IStateService,
                private $location: ng.ILocationService) {

        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: any) => {
            this.activeUrl = toState.url;
        });
        $scope.$on("selected-org-changed", (event: IAngularEvent, selected: IUserInfoOrganisation) => {
            this.show.admin = this.show.general = this.show.billing
                = this.show.generalMeeting = this.show.ticketing = this.show.certification
                = this.show.myResources = false;

            // Only temporary for the test environment
            const host = $location.host();
            if (host.indexOf("training.db.ripe.net") === 0
                || host.indexOf("apps-test.db.ripe.net") === 0
                || host.indexOf("rc.db.ripe.net") === 0) {
                this.show.testTrainingEnv = true;
            }

            if (!selected || !selected.roles) {
                return;
            }
            for (const role of selected.roles) {
                switch (role) {
                    case "admin":
                        this.show.admin = true;
                        break;
                    case "billing":
                        this.show.billing = true;
                        break;
                    case "certification":
                        this.show.certification = true;
                        break;
                    case "general":
                        this.show.general = true;
                        break;
                    case "generalMeeting":
                        this.show.generalMeeting = true;
                        break;
                    case "myResources":
                        this.show.myResources = true;
                        break;
                    case "ticketing":
                        this.show.ticketing = true;
                        break;
                    default:
                        break;
                }
            }
        });
    }

}

angular.module("dbWebApp").controller("LeftMenuController", LeftMenuController);
