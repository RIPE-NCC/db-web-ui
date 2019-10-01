import {Component} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {PropertiesService} from "../properties.service";

@Component({
    selector: "require-login",
    templateUrl: "./require-login.component.html",
})
export class RequireLoginComponent {

    public loginUrl: string;

    constructor(private properties: PropertiesService,
                private activatedRoute: ActivatedRoute) {
    }

    public ngOnInit() {
        this.loginUrl = this.getLoginUrl();
    }

    private getLoginUrl(): string {
        return this.properties.LOGIN_URL +
            "?originalUrl=" + encodeURIComponent(location.href.split("#")[0] +
                "#/fmp/" + this.getReturnUrlForForgotMaintainerPassword());
    }

    private getReturnUrlForForgotMaintainerPassword() {
        if (this.activatedRoute.snapshot.queryParamMap.has("mntnerKey")) {
            return "change-auth?mntnerKey=" +
                this.activatedRoute.snapshot.queryParamMap.get("mntnerKey") +
                "&voluntary=" + Boolean(this.activatedRoute.snapshot.queryParamMap.get("voluntary"));
        } else {
            return "";
        }
    }
}
