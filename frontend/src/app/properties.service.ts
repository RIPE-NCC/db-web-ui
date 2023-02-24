import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare var loadMatomo: (matomoId: string) => any;
declare var loadUsersnap: (buildTag: string) => any;

export interface IProperties {
    ENV: string;
    SOURCE: string;
    LOGIN_URL: string;
    ACCESS_URL: string;
    LOGOUT_URL: string;
    PORTAL_URL: string;
    PORTAL_URL_ACCOUNT: string;
    PORTAL_URL_REQUEST: string;
    BANNER: string;
    MATOMO_ID: string;
    REQUEST_RESOURCES_URL: string;
    REQUEST_UPDATE_URL: string;
    OPEN_ACQUISITION_URL: string;
    REQUEST_TRANSFER_URL: string;
    IPV4_TRANSFER_LISTING_URL: string;
    RPKI_DASHBOARD_URL: string;
    REST_SEARCH_URL: string;
    QUERY_PAGE_LINK_TO_OTHER_DB: string;
    DB_WEB_UI_BUILD_TIME: string;
    RIPE_APP_WEBCOMPONENTS_ENV: string;
    LIVE_CHAT_KEY: string;
    RIPE_NCC_MNTNERS: string[];
    TOP_RIPE_NCC_MNTNERS: string[];
    RIPE_NCC_HM_MNT: string;
    MNTNER_ALLOWED_TO_CREATE_AUTNUM: string;
    SESSION_TTL: number;
    RELEASE_NOTIFICATION_POLLING: number;
}

@Injectable()
export class PropertiesService {
    public ACCESS_URL = '';
    public BANNER = 'Welcome to the localhost version of the RIPE Database.';
    // Resources - menu items
    public MY_RESOURCES_URL = 'myresources/overview';
    // RIPE database - menu items
    public DATABASE_QUERY_URL = 'query';
    public DATABASE_FULL_TEXT_SEARCH_URL = 'fulltextsearch';
    public OBJECT_LOOKUP_URL = 'lookup';
    public DATABASE_SYNCUPDATES_URL = 'syncupdates';
    public DATABASE_CREATE_URL = 'webupdates/select';
    public DOCUMENTATION_URL = '/../docs';
    public LEGAL = 'legal';
    public ENV = 'local';
    public RIPE_APP_WEBCOMPONENTS_ENV = 'pre';
    public BREAKPOINTS_MOBILE_VIEW = 1025;
    public MATOMO_ID = '';
    public IPV4_TRANSFER_LISTING_URL = '';
    public LOGIN_URL = '';
    public LOGOUT_URL = '';
    public OPEN_ACQUISITION_URL = '';
    public PORTAL_URL = '';
    public PORTAL_URL_ACCOUNT = '';
    public PORTAL_URL_REQUEST = '';
    public LIVE_CHAT_KEY = '';
    public QUERY_PAGE_LINK_TO_OTHER_DB = '';
    public REQUEST_RESOURCES_URL = '';
    public REQUEST_TRANSFER_URL = '';
    public REQUEST_UPDATE_URL = '';
    public REST_SEARCH_URL = '';
    public RPKI_DASHBOARD_URL = '';
    public SOURCE = 'RIPE';
    public DB_WEB_UI_BUILD_TIME = '00:00';
    // list of all ripe ncc mntners
    public RIPE_NCC_MNTNERS = [];
    // maintainers on top-level allocation and PI assignments
    public TOP_RIPE_NCC_MNTNERS = [];
    public RIPE_NCC_HM_MNT = 'RIPE-NCC-HM-MNT';
    // maintainers allowed to create aut-num
    public MNTNER_ALLOWED_TO_CREATE_AUTNUM = {};
    public SESSION_TTL = 30000;
    public RELEASE_NOTIFICATION_POLLING = 30000;

    constructor(private httpClient: HttpClient) {}

    public load(): Promise<void> {
        return this.httpClient
            .get<IProperties>('app.constants.json')
            .toPromise()
            .then(
                (response) => {
                    this.ENV = response.ENV;
                    this.SOURCE = response.SOURCE;
                    this.LOGIN_URL = response.LOGIN_URL;
                    this.ACCESS_URL = response.ACCESS_URL;
                    this.LOGOUT_URL = response.LOGOUT_URL;
                    this.PORTAL_URL = response.PORTAL_URL;
                    this.PORTAL_URL_ACCOUNT = response.PORTAL_URL_ACCOUNT;
                    this.PORTAL_URL_REQUEST = response.PORTAL_URL_REQUEST;
                    this.BANNER = response.BANNER;
                    this.MATOMO_ID = response.MATOMO_ID;
                    this.REQUEST_RESOURCES_URL = response.REQUEST_RESOURCES_URL;
                    this.REQUEST_UPDATE_URL = response.REQUEST_UPDATE_URL;
                    this.OPEN_ACQUISITION_URL = response.OPEN_ACQUISITION_URL;
                    this.REQUEST_TRANSFER_URL = response.REQUEST_TRANSFER_URL;
                    this.IPV4_TRANSFER_LISTING_URL = response.IPV4_TRANSFER_LISTING_URL;
                    this.RPKI_DASHBOARD_URL = response.RPKI_DASHBOARD_URL;
                    this.REST_SEARCH_URL = response.REST_SEARCH_URL;
                    this.QUERY_PAGE_LINK_TO_OTHER_DB = response.QUERY_PAGE_LINK_TO_OTHER_DB;
                    this.DB_WEB_UI_BUILD_TIME = response.DB_WEB_UI_BUILD_TIME;
                    this.RIPE_APP_WEBCOMPONENTS_ENV =
                        this.ENV === 'prod' || this.ENV === 'test' || this.ENV === 'rc' || this.ENV === 'training' ? 'prod' : 'pre';
                    this.LIVE_CHAT_KEY = response.LIVE_CHAT_KEY;
                    this.RIPE_NCC_MNTNERS = response.RIPE_NCC_MNTNERS;
                    this.TOP_RIPE_NCC_MNTNERS = response.TOP_RIPE_NCC_MNTNERS;
                    this.RIPE_NCC_HM_MNT = response.RIPE_NCC_HM_MNT;
                    this.MNTNER_ALLOWED_TO_CREATE_AUTNUM = response.MNTNER_ALLOWED_TO_CREATE_AUTNUM || {};
                    this.SESSION_TTL = response.SESSION_TTL;
                    this.RELEASE_NOTIFICATION_POLLING = response.RELEASE_NOTIFICATION_POLLING;
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
        if (typeof loadUsersnap === 'function') {
            loadUsersnap(this.DB_WEB_UI_BUILD_TIME);
        }
    }

    public isProdEnv(): boolean {
        return this.ENV === 'prod';
    }

    public isTrainingEnv(): boolean {
        return this.ENV === 'training';
    }

    public isRcEnv(): boolean {
        return this.ENV === 'rc';
    }

    public isTestEnv(): boolean {
        return this.ENV === 'test';
    }

    public isNccMntner(mntnerKey: string): boolean {
        return this.TOP_RIPE_NCC_MNTNERS.includes(mntnerKey.toUpperCase());
    }

    public isAnyNccMntner(mntnerKey: string): boolean {
        return this.RIPE_NCC_MNTNERS.includes(mntnerKey.toUpperCase());
    }

    public isNccHmMntner(mntnerKey: string): boolean {
        return this.RIPE_NCC_HM_MNT === mntnerKey.toUpperCase();
    }
}
