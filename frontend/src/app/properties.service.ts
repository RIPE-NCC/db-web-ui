import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

declare var loadMatomo: (matomoId: string) => any;
declare var loadUsersnap: (buildTag: string) => any;

@Injectable()
export class PropertiesService {

    public ACCESS_URL = "https://access.prepdev.ripe.net?originalUrl=https://localhost.ripe.net:8443/db-web-ui/";
    public BANNER = "Welcome to the localhost version of the RIPE Database.";
    public BUILD_TAG = "SNAPSHOT";
    public DATABASE_CREATE_URL = "webupdates/select";
    public DATABASE_FULL_TEXT_SEARCH_URL = "fulltextsearch";
    public DATABASE_QUERY_URL = "query";
    public DATABASE_SYNCUPDATES_URL = "syncupdates";
    public ENV = "local";
    public MATOMO_ID = "BuGxbMDR_dev_0ae7dee0ac65f70a4e8cf1b8";
    public IPV4_TRANSFER_LISTING_URL = "";
    public LIR_ACCOUNT_DETAILS_URL = "";
    public LIR_API_ACCESS_KEYS_URL = "";
    public LIR_BILLING_DETAILS_URL = "";
    public LIR_GENERAL_MEETING_URL = "";
    public LIR_TICKETS_URL = "";
    public LIR_TRAINING_URL = "";
    public LIR_USER_ACCOUNTS_URL = "";
    public LOGIN_URL = "https://access.prepdev.ripe.net/";
    public LOGOUT_URL = "https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query";
    public MY_RESOURCES_URL = "myresources/overview";
    public OBJECT_LOOKUP_URL = "lookup";
    public OPEN_ACQUISITION_URL = "";
    public PORTAL_URL = "https://my.prepdev.ripe.net/";
    public QUERY_PAGE_LINK_TO_OTHER_DB = "";
    public REQUEST_RESOURCES_URL = "";
    public REQUEST_TRANSFER_URL = "";
    public REQUEST_UPDATE_URL = "";
    public REST_SEARCH_URL = "https://rest-prepdev.db.ripe.net/";
    public RPKI_DASHBOARD_URL = "";
    public SOURCE = "RIPE";
    public WHOIS_VERSION_DISPLAY_TEXT = "1.2.3.4";

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
                        this.BANNER = response.BANNER;
                        this.MATOMO_ID = response.MATOMO_ID;
                        this.LIR_ACCOUNT_DETAILS_URL = response.LIR_ACCOUNT_DETAILS_URL;
                        this.LIR_BILLING_DETAILS_URL = response.LIR_BILLING_DETAILS_URL;
                        this.LIR_GENERAL_MEETING_URL = response.LIR_GENERAL_MEETING_URL;
                        this.LIR_USER_ACCOUNTS_URL = response.LIR_USER_ACCOUNTS_URL;
                        this.LIR_TICKETS_URL = response.LIR_TICKETS_URL;
                        this.LIR_TRAINING_URL = response.LIR_TRAINING_URL;
                        this.LIR_API_ACCESS_KEYS_URL = response.LIR_API_ACCESS_KEYS_URL;
                        this.MY_RESOURCES_URL = response.MY_RESOURCES_URL;
                        this.REQUEST_RESOURCES_URL = response.REQUEST_RESOURCES_URL;
                        this.REQUEST_UPDATE_URL = response.REQUEST_UPDATE_URL;
                        this.OPEN_ACQUISITION_URL = response.OPEN_ACQUISITION_URL;
                        this.REQUEST_TRANSFER_URL = response.REQUEST_TRANSFER_URL;
                        this.IPV4_TRANSFER_LISTING_URL = response.IPV4_TRANSFER_LISTING_URL;
                        this.RPKI_DASHBOARD_URL = response.RPKI_DASHBOARD_URL;
                        this.REST_SEARCH_URL = response.REST_SEARCH_URL;
                        this.QUERY_PAGE_LINK_TO_OTHER_DB = response.QUERY_PAGE_LINK_TO_OTHER_DB;
                        this.WHOIS_VERSION_DISPLAY_TEXT = response.WHOIS_VERSION_DISPLAY_TEXT;

                        this.injectProperties();
                    },
                    (error => console.error(error))

                );
        } else {
            return new Promise((resolve, reject) => {
                this.injectProperties();
                resolve();
            })
        }

    }

    private injectProperties() {
        loadMatomo(this.MATOMO_ID);
        loadUsersnap(this.BUILD_TAG);
    }
}
