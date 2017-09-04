class LiveChatController {

    public static $inject = ["$scope", "$location"];

    private static MY_RESOURCES_PAGE_PATH = "myresources";
    private available: boolean = false;

    constructor(private $scope: angular.IScope, private $location: ng.ILocationService) {
        $scope.$on("selected-org-changed", (event: ng.IAngularEvent, selected: IUserInfoOrganisation) => {
            this.available = (selected as IUserInfoRegistration).membershipId !== undefined;
        });
    }

    public isLiveChatAvailable(): boolean {
        const myResourcesPage: boolean = this.$location.path().includes(LiveChatController.MY_RESOURCES_PAGE_PATH);
        return this.available && myResourcesPage;
    }
}

const liveChatComponent = {
    bindings: {
        available: "<",
    },
    controller: LiveChatController,
    templateUrl: "scripts/livechat/live-chat.html",
};

angular
    .module("dbWebApp")
    .component("liveChat", liveChatComponent);
