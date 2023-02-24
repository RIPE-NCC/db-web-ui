import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class PreferenceService {
    private expiredDate: Date;

    private UI_MODE_COOKIE = {
        name: 'pref-ui-mode',
        web: 'webupdates',
        text: 'textupdates',
        defaultValue: 'webupdates',
    };

    constructor(private cookies: CookieService) {
        this.expiredDate = new Date();
        this.expiredDate.setDate(this.expiredDate.getDate() + 7);
    }

    public setTextMode() {
        this.setCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.text);
    }

    public setWebMode() {
        this.setCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.web);
    }

    public isTextMode() {
        return this.getCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.defaultValue) === this.UI_MODE_COOKIE.text;
    }

    public isWebMode() {
        return this.getCookie(this.UI_MODE_COOKIE.name, this.UI_MODE_COOKIE.defaultValue) === this.UI_MODE_COOKIE.web;
    }

    private hasCookie(name: string): boolean {
        const value = this.cookies.get(name);
        return !_.isUndefined(value);
    }

    private setCookie(name: string, value: string) {
        this.cookies.set(name, value, 1, '/', '.ripe.net', true);
    }

    private getCookie(name: string, defaulValue: string): any {
        let value = this.cookies.get(name);
        if (_.isUndefined(value)) {
            value = defaulValue;
        }
        return value;
    }
}
