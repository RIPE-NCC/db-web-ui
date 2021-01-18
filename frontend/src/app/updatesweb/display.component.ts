import {Component, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {combineLatest, Subscription} from "rxjs";
import * as _ from "lodash";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {MessageStoreService} from "./message-store.service";
import {RestService} from "./rest.service";
import {UserInfoService} from "../userinfo/user-info.service";
import {WebUpdatesCommonsService} from "./web-updates-commons.service";
import {AlertsComponent} from "../shared/alert/alerts.component";

@Component({
    selector: "display",
    templateUrl: "./display.component.html",
})
export class DisplayComponent {

    public objectSource: string;
    public objectType: string;
    public objectName: string;
    public method: string;
    public before: string;
    public after: string;
    public loggedIn: boolean;
    public attributes: any;

    private subscription: Subscription;

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(public whoisResourcesService: WhoisResourcesService,
                public messageStoreService: MessageStoreService,
                private restService: RestService,
                private userInfoService: UserInfoService,
                private webUpdatesCommonsService: WebUpdatesCommonsService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {}

    public ngOnInit() {
        this.subscription = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
            .subscribe((params: any) => {
                // extract parameters from the url
                this.objectSource = params[0].source;
                this.objectType = params[0].objectType;
                // url-decode otherwise newly-created resource is MessageStoreService will not be found
                this.objectName = decodeURIComponent(params[0].objectName);
                this.method = params[1].method || undefined; // optional: added by create- and modify-controlle"

                this.init()
            })
        }

    private init() {

        /*
         * Start of initialisation phase
         */
        console.debug("DisplayComponent: Url params: source:" + this.objectSource + ". objectType:" + this.objectType +
            ", objectName:" + this.objectName + ", method:" + this.method);

        this.userInfoService.getUserOrgsAndRoles()
            .subscribe(() => {
                this.loggedIn = true;
            },
        );

        // fetch just created object from temporary store
        const cached = this.messageStoreService.get(this.objectName);
        if (!_.isUndefined(cached)) {
            const whoisResources = this.whoisResourcesService.validateWhoisResources(cached);
            this.attributes = this.whoisResourcesService.getAttributes(whoisResources);
            this.alertsComponent.populateFieldSpecificErrors(this.objectType, this.attributes, cached);
            this.alertsComponent.setErrors(whoisResources);

            if (this.method === "Modify") {
                const diff = this.whoisResourcesService.validateAttributes(this.messageStoreService.get("DIFF"));
                if (!_.isUndefined(diff)) {
                    this.before = this.whoisResourcesService.toPlaintext(diff);
                    this.after = this.whoisResourcesService.toPlaintext(this.attributes);
                }
            }
            this.webUpdatesCommonsService.addLinkToReferenceAttributes(this.attributes, this.objectSource);
        } else {
            this.restService.fetchObject(this.objectSource, this.objectType, this.objectName, null, null)
                .subscribe((resp: any) => {
                    this.attributes = this.whoisResourcesService.getAttributes(resp);
                    this.webUpdatesCommonsService.addLinkToReferenceAttributes(this.attributes, this.objectSource);
                    this.alertsComponent.populateFieldSpecificErrors(this.objectType, this.attributes, resp);
                    this.alertsComponent.setErrors(resp);
                }, (resp: any) => {
                    this.alertsComponent.populateFieldSpecificErrors(this.objectType, this.attributes, resp.data);
                    this.alertsComponent.setErrors(resp.data);
                },
            );
        }
    }

    public ngOnDestroy() {
      this.alertsComponent.clearAlertMessages();
    }

    /*
     * Methods called from the html-template
     */
    public modifyButtonToBeShown() {
        return this.alertsComponent && !this.alertsComponent.hasErrors() && !this.isPending();
    }

    private isPending() {
        return !_.isUndefined(this.method) && this.method === "Pending";
    }

    public isCreateOrModify() {
        return !(_.isUndefined(this.method) || this.isPending());
    }

    public getOperationName() {
        let name = "";
        if (this.method === "Create") {
            name = "created";
        } else if (this.method === "Modify") {
            name = "modified";
        }
        return name;
    }

    public navigateToSelect() {
        return this.router.navigate(["webupdates/select"]);
    }

    public navigateToModify() {
        return this.router.navigateByUrl(`webupdates/modify/${this.objectSource}/${this.objectType}/${encodeURIComponent(this.objectName)}`);
    }

    public isDiff() {
        return !_.isUndefined(this.before) && !_.isUndefined(this.after);
    }
}
