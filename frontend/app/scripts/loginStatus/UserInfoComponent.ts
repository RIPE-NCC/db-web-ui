declare var RIPE: any;
declare var init_user_menu: any;
declare var display_user_menu: any;
declare var init_sso_nav: any;

class UserInfoController {
    public static $inject = [
        "$log",
        "UserInfoService",
        "Properties",
    ];

    constructor(private $log: angular.ILogService,
                private userInfoService: UserInfoService,
                private properties: IProperties) {

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
                            ["Logout", this.properties.LOGOUT_URL]],
                };
                RIPE.userimg = this.properties.LOGIN_URL + "/picture/" + userInfo.user.uuid;
                RIPE.user = {
                    buildTag: this.properties.BUILD_TAG,
                    email: userInfo.user.username,
                    fullName: userInfo.user.displayName,
                };
                this.initLoggedIn();
            }, (error: Error): void => {
                this.$log.debug("Login error");
            });
    }

    private initLoggedIn(): void {
        angular.element(document.querySelector("#loggedin .profile, #loggedin a.active")).unbind("click");
        init_user_menu();
        display_user_menu();
        init_sso_nav();
    }

}

angular.module("loginStatus")
    .component("userInfo", {
        controller: UserInfoController,
        templateUrl: "./user-info.html",
    });
