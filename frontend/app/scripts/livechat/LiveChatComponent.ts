class LiveChatController {

    public static $inject = ["$scope", "$location", "UserInfoService", "$window"];

    private static MY_RESOURCES_PAGE_PATH = "myresources";
    public loggedInUser: boolean = true;
    private selected: IUserInfoRegistration;

    constructor(private $scope: angular.IScope,
                private $location: ng.ILocationService,
                private userInfoService: UserInfoService,
                private $window: any) {
        $scope.$on("selected-org-changed", (event: ng.IAngularEvent, selected: IUserInfoOrganisation) => {
            this.selected = (selected as IUserInfoRegistration);
            this.checkLoggedInUserAndUpdateUserLikeData(this.selected);
        });
    }

    public isLiveChatEnabled(): boolean {
        return this.isOnMyResourcePage() && this.isSelectedMember();
    }

    private isSelectedMember(): boolean {
        return this.selected !== undefined && this.selected.membershipId !== undefined;
    }

    private isOnMyResourcePage(): boolean {
        return this.$location.path().includes(LiveChatController.MY_RESOURCES_PAGE_PATH);
    }

    private checkLoggedInUserAndUpdateUserLikeData(selected: IUserInfoRegistration) {
        this.$window.userlikeData = this.$window.userlikeData || {};
        this.userInfoService.getLoggedInUser().then((user: IUserInfo) => {
            this.$window.userlikeData.user = {};
            this.$window.userlikeData.user.name = user.displayName;
            this.$window.userlikeData.user.email = user.username;
            this.$window.userlikeData.custom = {};
            this.$window.userlikeData.custom.roles = selected.roles.join(", ");
            this.$window.userlikeData.custom.registries = selected.regId;
        }, () => {
            // If user is logged out, make sure to disable the chat
            this.$window.userlikeData = {};
            // Turn off live chat if an error occurs while checking logged in user.
            this.loggedInUser = false;
        });
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
