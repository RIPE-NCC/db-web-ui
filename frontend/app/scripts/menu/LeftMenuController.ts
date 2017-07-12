import IAngularEvent = angular.IAngularEvent;

class LeftMenuController {
    public static $inject = ["$rootScope", "$scope", "$state"];

    public activeUrl: string;
    public show: {
        admin: boolean;
        billing: boolean;
        certification: boolean;
        general: boolean;
        generalMeeting: boolean;
        ticketing: boolean;
    } = {
        admin: false,
        billing: false,
        certification: false,
        general: false,
        generalMeeting: false,
        ticketing: false,
    };

    constructor(private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private $state: ng.ui.IStateService) {

        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: any) => {
            this.activeUrl = toState.url;
        });

        $scope.$on("selected-org-changed", (event: IAngularEvent, selected: IUserInfoOrganisation) => {
            this.show.admin = this.show.general = this.show.billing
                = this.show.generalMeeting = this.show.ticketing = this.show.certification = false;

            if (!selected || !selected.roles) {
                return;
            }
            for (const role of selected.roles) {
                switch (role.toLowerCase()) {
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
                    case "generalmeeting":
                        this.show.generalMeeting = true;
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
