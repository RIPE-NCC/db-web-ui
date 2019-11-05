import {Injectable} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import * as _ from "lodash";

@Injectable()
export class PreferenceService {

    private expiredDate: Date;

    private UI_MODE_COOKIE = {
        name: "pref-ui-mode",
        web: "webupdates",
        text: "textupdates",
        defaultValue: "webupdates",
    };

    private SYNCUPDATE_MODE_COOKIE = {
        name: "pref-syncupdates-mode",
        poor: "poor",
        rich: "rich",
        defaultValue: "poor",
    };

    constructor(private cookies: CookieService) {
        this.expiredDate = new Date();
        this.expiredDate.setDate(this.expiredDate.getDate() + 7);
    }

    public setTextMode() {
        this.setCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.text, undefined);
    }

    public setWebMode() {
        this.setCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.web, undefined);
    }

    public isTextMode() {
        return this.getCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.defaultValue) === this.UI_MODE_COOKIE.text;
    }

    public isWebMode() {
        return this.getCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.defaultValue) === this.UI_MODE_COOKIE.web;
    }

    public setRichSyncupdatesMode() {
        this.setCookie(this.SYNCUPDATE_MODE_COOKIE.name, this.SYNCUPDATE_MODE_COOKIE.rich, "/");
    }

    public setPoorSyncupdatesMode() {
        this.setCookie(this.SYNCUPDATE_MODE_COOKIE.name, this.SYNCUPDATE_MODE_COOKIE.poor, "/");
    }

    public isRichSyncupdatesMode() {
        return this.getCookie(this.SYNCUPDATE_MODE_COOKIE.name, this.SYNCUPDATE_MODE_COOKIE.defaultValue) === this.SYNCUPDATE_MODE_COOKIE.rich;
    }

    public isPoorSyncupdatesMode() {
        return this.getCookie(this.SYNCUPDATE_MODE_COOKIE.name, this.SYNCUPDATE_MODE_COOKIE.defaultValue) === this.SYNCUPDATE_MODE_COOKIE.poor;
    }

    public hasMadeSyncUpdatesDecision() {
        return this.hasCookie(this.SYNCUPDATE_MODE_COOKIE.name);
    }

    private hasCookie(name: string): boolean {
        const value = this.cookies.get(name);
        return !_.isUndefined(value);
    }

    private setCookie(name: string, value: string, path: string) {
        this.cookies.set(name, value, this.expiredDate, path);
    }

    private getCookie(name: string, defaulValue: string): any {
        let value = this.cookies.get(name);
        if (_.isUndefined(value)) {
            value = defaulValue;
        }
        return value;
    }
}
