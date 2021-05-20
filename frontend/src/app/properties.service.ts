import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

declare var loadMatomo: (matomoId: string) => any;
declare var loadUsersnap: (buildTag: string) => any;

@Injectable()
export class PropertiesService {

    public ACCESS_URL = "https://access.prepdev.ripe.net?originalUrl=https://localhost.ripe.net:8443/db-web-ui/";
    public BANNER = "Welcome to the localhost version of the RIPE Database.";
    // FIXME This tag is not used anymore... remove it after merging https://gitlab.ripe.net/swe-database-team/db-web-ui/-/commits/DB-3160_ripe_web_component_login_switcher
    // also clean getImplementationVersion in AngularConstantsController
    public BUILD_TAG = "SNAPSHOT";
    public DATABASE_CREATE_URL = "webupdates/select";
    public DATABASE_FULL_TEXT_SEARCH_URL = "fulltextsearch";
    public DATABASE_QUERY_URL = "query";
    public DATABASE_SYNCUPDATES_URL = "syncupdates";
    public ENV = "local";
    public RIPE_APP_WEBCOMPONENTS_ENV = "pre";
    public MATOMO_ID = "BuGxbMDR_dev_0ae7dee0ac65f70a4e8cf1b8";
    public IPV4_TRANSFER_LISTING_URL = "";
    public LOGIN_URL = "https://access.prepdev.ripe.net/";
    public LOGOUT_URL = "https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query";
    public MY_RESOURCES_URL = "myresources/overview";
    public OBJECT_LOOKUP_URL = "lookup";
    public OPEN_ACQUISITION_URL = "";
    public PORTAL_URL = "https://my.prepdev.ripe.net/";
    public PORTAL_URL_ACCOUNT = "";
    public PORTAL_URL_REQUEST = "";
    public LIVE_CHAT_KEY = "98e82f81b368ddac660f7980f60227954738de3d5b6eaf8d07fc763f617d80b5";
    public QUERY_PAGE_LINK_TO_OTHER_DB = "";
    public REQUEST_RESOURCES_URL = "";
    public REQUEST_TRANSFER_URL = "";
    public REQUEST_UPDATE_URL = "";
    public REST_SEARCH_URL = "https://rest-prepdev.db.ripe.net/";
    public RPKI_DASHBOARD_URL = "";
    public SOURCE = "RIPE";
    public DB_WEB_UI_BUILD_TIME = "00:00";
    public LEGAL = "legal";

    constructor(private httpClient: HttpClient) { }

    public load(): Promise<void> {
        // @ts-ignore
        if (process.env.NODE_ENV === "production") {
            return this.httpClient
                .get("app.constants.json")
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
                        this.MY_RESOURCES_URL = response.MY_RESOURCES_URL;
                        this.REQUEST_RESOURCES_URL = response.REQUEST_RESOURCES_URL;
                        this.REQUEST_UPDATE_URL = response.REQUEST_UPDATE_URL;
                        this.OPEN_ACQUISITION_URL = response.OPEN_ACQUISITION_URL;
                        this.REQUEST_TRANSFER_URL = response.REQUEST_TRANSFER_URL;
                        this.IPV4_TRANSFER_LISTING_URL = response.IPV4_TRANSFER_LISTING_URL;
                        this.RPKI_DASHBOARD_URL = response.RPKI_DASHBOARD_URL;
                        this.REST_SEARCH_URL = response.REST_SEARCH_URL;
                        this.QUERY_PAGE_LINK_TO_OTHER_DB = response.QUERY_PAGE_LINK_TO_OTHER_DB;
                        this.DB_WEB_UI_BUILD_TIME = response.DB_WEB_UI_BUILD_TIME;
                        this.RIPE_APP_WEBCOMPONENTS_ENV = this.ENV === "prod" ? "prod" : "pre";

                        this.injectProperties();
                    },
                    (error => console.error(error))

                );
        } else {
            return new Promise((resolve) => {
                this.injectProperties();
                resolve();
            })
        }

    }

    private injectProperties() {
        if (typeof loadMatomo === 'function') { loadMatomo(this.MATOMO_ID) }
        if (typeof loadUsersnap === 'function') { loadUsersnap(this.DB_WEB_UI_BUILD_TIME) }
    }
}
