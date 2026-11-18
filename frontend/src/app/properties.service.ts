import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

declare let loadMatomo: (matomoId: string) => any;

export interface IProperties {
    ENV: string;
    SOURCE: string;
    LOGIN_URL: string;
    ACCESS_URL: string;
    LOGOUT_URL: string;
    PORTAL_URL: string;
    PORTAL_URL_ACCOUNT: string;
    PORTAL_URL_REQUEST: string;
    NEWEST_PORTAL_URL: string;
    BANNER: string;
    MATOMO_ID: string;
    REST_SEARCH_URL: string;
    QUERY_PAGE_LINK_TO_OTHER_DB: string;
    DB_WEB_UI_BUILD_TIME: string;
    RIPE_APP_WEBCOMPONENTS_ENV: string;
    LIVE_CHAT_KEY: string;
    RIPE_NCC_MNTNERS: string[];
    TOP_RIPE_NCC_MNTNERS: string[];
    RIPE_NCC_HM_MNT: string;
    SESSION_TTL: number;
    RELEASE_NOTIFICATION_POLLING: number;
    NO_PASSWORD_AUTH_POPUP: boolean;
    LINK_TO_MANAGE_APIKEYS_IN_ACCESS: string;
    REST_API_RIPE_URL: string;
}

@Injectable({ providedIn: 'root' })
export class PropertiesService {
    private httpClient = inject(HttpClient);

    ACCESS_URL = '';
    BANNER = 'Welcome to the localhost version of the RIPE Database.';
    ENV = 'local';
    RIPE_APP_WEBCOMPONENTS_ENV = 'pre';
    static BREAKPOINTS_MOBILE_VIEW = 1025;
    MATOMO_ID = '';
    LOGIN_URL = '';
    LOGOUT_URL = '';
    PORTAL_URL = '';
    PORTAL_URL_ACCOUNT = '';
    PORTAL_URL_REQUEST = '';
    NEWEST_PORTAL_URL = '';
    LIVE_CHAT_KEY = '';
    QUERY_PAGE_LINK_TO_OTHER_DB = '';
    REST_SEARCH_URL = '';
    SOURCE = 'RIPE';
    DB_WEB_UI_BUILD_TIME = '00:00';
    // list of all ripe ncc mntners
    RIPE_NCC_MNTNERS: string[] = [];
    // maintainers on top-level allocation and PI assignments
    TOP_RIPE_NCC_MNTNERS: string[] = [];
    RIPE_NCC_HM_MNT = 'RIPE-NCC-HM-MNT';
    SESSION_TTL = 30000;
    RELEASE_NOTIFICATION_POLLING = 30000;
    NO_PASSWORD_AUTH_POPUP = false;
    LINK_TO_MANAGE_APIKEYS_IN_ACCESS = '';
    REST_API_RIPE_URL = '';

    load(): Promise<void> {
        return firstValueFrom(this.httpClient.get<IProperties>('app.constants.json')).then(
            (response) => {
                this.ENV = response.ENV;
                this.SOURCE = response.SOURCE;
                this.LOGIN_URL = response.LOGIN_URL;
                this.ACCESS_URL = response.ACCESS_URL;
                this.LOGOUT_URL = response.LOGOUT_URL;
                this.PORTAL_URL = response.PORTAL_URL;
                this.PORTAL_URL_ACCOUNT = response.PORTAL_URL_ACCOUNT;
                this.PORTAL_URL_REQUEST = response.PORTAL_URL_REQUEST;
                this.NEWEST_PORTAL_URL = response.NEWEST_PORTAL_URL;
                this.BANNER = response.BANNER;
                this.MATOMO_ID = response.MATOMO_ID;
                this.REST_SEARCH_URL = response.REST_SEARCH_URL;
                this.QUERY_PAGE_LINK_TO_OTHER_DB = response.QUERY_PAGE_LINK_TO_OTHER_DB;
                this.DB_WEB_UI_BUILD_TIME = response.DB_WEB_UI_BUILD_TIME;
                this.RIPE_APP_WEBCOMPONENTS_ENV = this.ENV === 'prod' || this.ENV === 'test' || this.ENV === 'rc' || this.ENV === 'training' ? 'prod' : 'pre';
                this.LIVE_CHAT_KEY = response.LIVE_CHAT_KEY;
                this.RIPE_NCC_MNTNERS = response.RIPE_NCC_MNTNERS;
                this.TOP_RIPE_NCC_MNTNERS = response.TOP_RIPE_NCC_MNTNERS;
                this.RIPE_NCC_HM_MNT = response.RIPE_NCC_HM_MNT;
                this.SESSION_TTL = response.SESSION_TTL;
                this.RELEASE_NOTIFICATION_POLLING = response.RELEASE_NOTIFICATION_POLLING;
                this.NO_PASSWORD_AUTH_POPUP = response.NO_PASSWORD_AUTH_POPUP;
                this.LINK_TO_MANAGE_APIKEYS_IN_ACCESS = response.LINK_TO_MANAGE_APIKEYS_IN_ACCESS;
                this.REST_API_RIPE_URL = response.REST_API_RIPE_URL;
                // once we deploy the db-operational

                this.injectProperties();
            },
            (error) => console.error(error),
        );
    }

    private injectProperties() {
        if (typeof loadMatomo === 'function') {
            loadMatomo(this.MATOMO_ID);
        }
    }

    isProdEnv(): boolean {
        return this.ENV === 'prod';
    }

    isTrainingEnv(): boolean {
        return this.ENV === 'training';
    }

    isTestEnv(): boolean {
        return this.ENV === 'test';
    }

    isNccMntner(mntnerKey: string): boolean {
        return this.TOP_RIPE_NCC_MNTNERS.includes(mntnerKey.toUpperCase());
    }

    isAnyNccMntner(mntnerKey: string): boolean {
        return this.RIPE_NCC_MNTNERS.includes(mntnerKey.toUpperCase());
    }

    isNccHmMntner(mntnerKey: string): boolean {
        return this.RIPE_NCC_HM_MNT === mntnerKey.toUpperCase();
    }

    isEnableNonAuthUpdates(): boolean {
        return (
            !this.isProdEnv() && // Security property, this should never be enabled in PROD
            this.NO_PASSWORD_AUTH_POPUP
        );
    }

    static getInnerWidth() {
        return window.innerWidth;
    }

    static isMobileView() {
        return PropertiesService.getInnerWidth() < PropertiesService.BREAKPOINTS_MOBILE_VIEW;
    }

    getTitleEnvironment() {
        if (this.isProdEnv()) {
            return 'RIPE';
        } else if (this.isTrainingEnv()) {
            return 'Training';
        } else {
            return `${this.ENV.toUpperCase()}`;
        }
    }
}
