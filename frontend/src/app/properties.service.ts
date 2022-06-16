import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare var loadMatomo: (matomoId: string) => any;
declare var loadUsersnap: (buildTag: string) => any;

@Injectable()
export class PropertiesService {
    public ACCESS_URL = '';
    public BANNER = 'Welcome to the localhost version of the RIPE Database.';
    // FIXME This tag is not used anymore... remove it after merging https://gitlab.ripe.net/swe-database-team/db-web-ui/-/commits/DB-3160_ripe_web_component_login_switcher
    // also clean getImplementationVersion in AngularConstantsController
    public BUILD_TAG = 'SNAPSHOT';
    // Resources - menu items
    public MY_RESOURCES_URL = 'myresources/overview';
    // RIPE database - menu items
    public DATABASE_QUERY_URL = 'query';
    public DATABASE_FULL_TEXT_SEARCH_URL = 'fulltextsearch';
    public OBJECT_LOOKUP_URL = 'lookup';
    public DATABASE_SYNCUPDATES_URL = 'syncupdates';
    public DATABASE_CREATE_URL = 'webupdates/select';
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
    // maintainers allowed to create aut-num
    public MNTNER_ALLOWED_TO_CREATE_AUTNUM = [];

    constructor(private httpClient: HttpClient) {}

    public load(): Promise<void> {
        return this.httpClient
            .get('app.constants.json')
            .toPromise()
            .then(
                (response: any) => {
                    this.ENV = response.ENV;
                    this.SOURCE = response.SOURCE;
                    this.BUILD_TAG = response.BUILD_TAG;
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
                    this.RIPE_APP_WEBCOMPONENTS_ENV = this.ENV === 'prod' ? 'prod' : 'pre';
                    this.LIVE_CHAT_KEY = response.LIVE_CHAT_KEY;
                    this.RIPE_NCC_MNTNERS = response.RIPE_NCC_MNTNERS;
                    this.TOP_RIPE_NCC_MNTNERS = response.TOP_RIPE_NCC_MNTNERS;
                    this.MNTNER_ALLOWED_TO_CREATE_AUTNUM = response.MNTNER_ALLOWED_TO_CREATE_AUTNUM;

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

    public isTrainingEnv(): boolean {
        return this.ENV === 'training';
    }

    public isTestRcEnv(): boolean {
        return this.ENV === 'test' || this.ENV === 'rc';
    }

    public isTestEnv(): boolean {
        return this.ENV === 'test';
    }
}
