import {Component} from "@angular/core";
import {UserInfoService} from "./user-info.service";
import {IUserInfoResponseData} from "../dropdown/org-data-type.model";
import {PropertiesService} from "../properties.service";

declare var RIPE: any;
declare var init_user_menu: any;
declare var display_user_menu: any;
declare var init_sso_nav: any;
declare var $: any;

@Component({
    selector: "user-info",
    templateUrl: "./user-info.component.html",
})
export class UserInfoComponent {

    constructor(private userInfoService: UserInfoService,
                public properties: PropertiesService) {
        this.userInfoService.userLoggedIn$.subscribe((userInfo: IUserInfoResponseData) => {
            this.initUserInfo(userInfo);
        });
    }

    public ngOnInit() {
        console.debug("Using login-url:" + this.properties.LOGIN_URL);
        this.userInfoService.getUserOrgsAndRoles()
            .subscribe((userInfo: IUserInfoResponseData): void => {
                this.initUserInfo(userInfo);
            }, (): void => {
                console.debug("Login error");
            });
    }

    private initUserInfo(userInfo: IUserInfoResponseData) {
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
    }

    private initLoggedIn(): void {
        $('#loggedin .profile, #loggedin a.active').off("click");
        init_user_menu();
        display_user_menu();
        init_sso_nav();
    }
}
