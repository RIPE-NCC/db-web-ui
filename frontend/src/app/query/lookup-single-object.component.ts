import {Component, OnDestroy} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {LookupService} from "./lookup.service";
import {PropertiesService} from "../properties.service";
import {IWhoisObjectModel, IWhoisResponseModel} from "../shared/whois-response-type.model";

@Component({
    selector: "lookup-single",
    templateUrl: "./lookup-single-object.component.html",
})
export class LookupSingleObjectComponent implements OnDestroy {

    public whoisResponse: any;
    public error: string;

    public source: string;
    public objectType: string;
    public objectName: string;

    private subscription: Subscription;

    constructor(private lookupService: LookupService,
                public properties: PropertiesService,
                public activatedRoute: ActivatedRoute,
                public router: Router) {
    }

    public ngOnInit() {
        this.subscription = this.activatedRoute.queryParams.subscribe((params) => {
            this.source = params.source;
            this.objectType = params.type;
            this.objectName = params.key;
            this.init()
        });
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private init() {
        try {
            this.lookupService.lookupWhoisObject({source: this.source, type: this.objectType, key: this.objectName})
                .subscribe((response: any) => {
                    if (response &&
                        response.objects &&
                        response.objects.object &&
                        response.objects.object.length === 1) {
                        this.whoisResponse = response.objects.object[0];
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
                        this.error = "An error occurred looking for " + this.objectType + " " + this.objectName;
                    }
                }));
        } catch (e) {
            this.error = "An error occurred looking for " + this.objectType + " " + this.objectName;
        }
    }

    public goToUpdate() {
        this.router.navigate(["webupdates/modify", this.source, this.objectType, this.objectName]);
    }

    public goToLookup() {
        const queryParam = {source: this.properties.SOURCE, type: this.objectType, key: this.objectName};
        this.router.navigate(["lookup"], {queryParams: queryParam});
    }
}
