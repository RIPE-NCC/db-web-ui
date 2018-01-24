declare var RIPE: any;
declare var init_user_menu: any;
declare var display_user_menu: any;

class UserInfoController {
    public static $inject = [
        "$scope",
        "$log",
        "UserInfoService",
        "Properties",
        "ERROR_EVENTS",
    ];

    constructor(private $rootScope: angular.IRootScopeService,
                private $log: angular.ILogService,
                private userInfoService: UserInfoService,
                private properties: IProperties,
                private ERROR_EVENTS: any) {

        this.initialize();
    }

    private initialize(): void {
        this.$log.debug("Using login-url:" + this.properties.LOGIN_URL);
        this.userInfoService.getUserOrgsAndRoles()
            .then((userInfo: IUserInfoResponseData): void => {
                RIPE.username = userInfo.user.displayName;
                RIPE.usermail = userInfo.user.username;
                RIPE.usermenu = {
                    "User details": [["Profile", this.properties.LOGIN_URL + "/profile"],
                            ["Logout", this.properties.LOGIN_URL + "/logout"]],
                };
                RIPE.userimg = this.properties.LOGIN_URL + "/picture/" + userInfo.user.uuid;
                RIPE.user = {
                    fullName: userInfo.user.displayName,
                    email: userInfo.user.username,
                    buildTag: this.properties.BUILD_TAG,
                };
                init_user_menu();
                display_user_menu();
            }, (error: Error): void => {
                this.$log.debug("Login error");
            });
    }

}

angular
    .module("loginStatus")
    .controller("UserInfoController", UserInfoController);
