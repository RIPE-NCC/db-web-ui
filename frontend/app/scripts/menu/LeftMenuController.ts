class LeftMenuController {
    public static $inject = ["$rootScope", "$scope", "EnvironmentStatus"];

    public activeUrl: string;
    public show: {
        admin: boolean;
        billing: boolean;
        certification: boolean;
        general: boolean;
        generalMeeting: boolean;
        guest: boolean;
        myResources: boolean;
        testRcEnv: boolean;
        ticketing: boolean;
        // Only temporary for the test environment
        trainingEnv: boolean;
    } = {
        admin: false,
        billing: false,
        certification: false,
        general: false,
        generalMeeting: false,
        guest: false,
        myResources: false,
        testRcEnv: false,
        ticketing: false,
        // Only temporary for the test environment
        trainingEnv: false,
    };

    public dbMenuIsActive: boolean;

    constructor(private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private EnvironmentStatus: EnvironmentStatus) {

        $rootScope.$on("$stateChangeSuccess", (event: angular.IAngularEvent, toState: any) => {
            this.activeUrl = toState.url;
            this.dbMenuIsActive =
                this.activeUrl.indexOf("/wizard") > -1 ||
                this.activeUrl.indexOf("/select") > -1 ||
                this.activeUrl.indexOf("/create") > -1 ||
                this.activeUrl.indexOf("/display") > -1 ||
                this.activeUrl.indexOf("/modify") > -1 ||
                this.activeUrl.indexOf("/query") > -1 ||
                this.activeUrl.indexOf("/fulltextsearch") > -1 ||
                this.activeUrl.indexOf("/lookup") > -1 ||
                this.activeUrl.indexOf("/multi") > -1 ||
                this.activeUrl.indexOf("/syncupdates") > -1;
        });
        $scope.$on("selected-org-changed", (event: angular.IAngularEvent, selected: IUserInfoOrganisation) => {
            this.show.admin = this.show.general = this.show.billing
                = this.show.generalMeeting = this.show.ticketing = this.show.certification
                = this.show.myResources = false;

            // Only temporary for the test environment
            this.show.testRcEnv = this.EnvironmentStatus.isTestRcEnv();
            this.show.trainingEnv = this.EnvironmentStatus.isTrainingEnv();

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
                    case "guest":
                        this.show.guest = true;
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
