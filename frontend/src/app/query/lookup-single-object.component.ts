import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {LookupService} from "./lookup.service";
import {PropertiesService} from "../properties.service";
import {IVersion} from "../shared/whois-response-type.model";
import {AlertsService} from "../shared/alert/alerts.service";
import {Labels} from "../label.constants";

@Component({
    selector: "lookup-single",
    templateUrl: "./lookup-single-object.component.html",
})
export class LookupSingleObjectComponent implements OnInit, OnDestroy {

    public whoisResponse: any;
    public error: string;
    public whoisVersion: IVersion;

    public source: string;
    public objectType: string;
    public objectName: string;

    private subscription: Subscription;

    constructor(private lookupService: LookupService,
                public properties: PropertiesService,
                public activatedRoute: ActivatedRoute,
                public alertsService: AlertsService,
                public router: Router) {
    }

    ngOnInit() {
        this.subscription = this.activatedRoute.queryParams.subscribe((params) => {
            this.source = params.source;
            this.objectType = params.type;
            this.objectName = params.key;
            this.init()
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.alertsService.clearAlertMessages();
    }

    private init() {
        try {
            this.lookupService.lookupWhoisObject({source: this.source, type: this.objectType, key: this.objectName})
                .subscribe((response: any) => {
                    this.alertsService.clearAlertMessages();
                    if (response &&
                        response.objects &&
                        response.objects.object &&
                        response.objects.object.length === 1) {
                        this.whoisResponse = response.objects.object[0];
                        this.whoisVersion = response.version;
                        this.alertsService.addGlobalInfo(Labels["msg.searchResultsTandCLink.text"], "https://www.ripe.net/db/support/db-terms-conditions.html", Labels["msg.termsAndConditions.text"]);
                    } else {
                        console.warn(
                            "Expected a single object from query. source:", this.source,
                            "type:", this.objectType,
                            "name:", this.objectName);
                    }
                }, (() => {
                    // reload page in case in query params source was NONAUTH and object doesn't exist in mirror database
                    if (this.source !== this.properties.SOURCE) {
                        this.goToLookup();
                    } else {
                        this.alertsService.addGlobalError(`An error occurred looking for ${this.objectType} ${this.objectName}`);
                    }
                }));
        } catch (e) {
            this.alertsService.addGlobalError(`An error occurred looking for ${this.objectType} ${this.objectName}`);
        }
    }

    public goToLookup() {
        const queryParam = {source: this.properties.SOURCE, type: this.objectType, key: this.objectName};
        this.router.navigate(["lookup"], {queryParams: queryParam});
    }
}
