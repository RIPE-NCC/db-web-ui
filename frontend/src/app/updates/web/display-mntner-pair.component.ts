import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {WhoisResourcesService} from "../../shared/whois-resources.service";
import {MessageStoreService} from "../message-store.service";
import {RestService} from "../rest.service";
import {AlertsService} from "../../shared/alert/alerts.service";
import {IAttributeModel} from "../../shared/whois-response-type.model";

@Component({
    selector: "display-mntner-pair",
    templateUrl: "./display-mntner-pair.component.html",
})
export class DisplayMntnerPairComponent {

    public objectSource: string;
    public objectType: string;
    public objectTypeName: string;
    public mntnerName: string;
    public objectTypeAttributes: IAttributeModel[];
    public mntnerAttributes: IAttributeModel[];

    constructor(private whoisResourcesService: WhoisResourcesService,
                private messageStoreService: MessageStoreService,
                private restService: RestService,
                public alertService: AlertsService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {}

    public ngOnInit() {
        this.alertService.clearErrors();

        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.objectSource = paramMap.get("source");
        this.objectType = paramMap.has("person") ? "person" : "role";
        this.objectTypeName = paramMap.get(this.objectType);
        this.mntnerName = paramMap.get("mntner");

        // fetch just created object from temporary store
        const cachedPersonObject = this.messageStoreService.get(this.objectTypeName);
        if (cachedPersonObject) {
            const whoisResources = this.whoisResourcesService.validateWhoisResources(cachedPersonObject);
            this.objectTypeAttributes = this.whoisResourcesService.getAttributes(whoisResources);
            console.debug("Got person from cache:" + JSON.stringify(this.objectTypeAttributes));
        } else {
            this.restService.fetchObject(this.objectSource, this.objectType, this.objectTypeName, null, null)
                .subscribe((resp: any) => {
                    this.objectTypeAttributes = this.whoisResourcesService.getAttributes(resp);
                    this.alertService.populateFieldSpecificErrors(this.objectType, this.objectTypeAttributes, resp);
                    this.alertService.addErrors(resp);
                }, (error: any) => {
                    this.alertService.populateFieldSpecificErrors(this.objectType, this.objectTypeAttributes, error.data);
                    this.alertService.addErrors(error.data);
                });
        }

        const cachedMntnerObject = this.messageStoreService.get(this.mntnerName);
        if (cachedMntnerObject) {
            const whoisResources = this.whoisResourcesService.validateWhoisResources(cachedMntnerObject);
            this.mntnerAttributes = this.whoisResourcesService.getAttributes(whoisResources);
            console.debug("Got mntner from cache:" + JSON.stringify(this.mntnerAttributes));
        } else {
            this.restService.fetchObject(this.objectSource, "mntner", this.mntnerName, null, null)
                .subscribe((resp: any) => {
                    this.mntnerAttributes = this.whoisResourcesService.getAttributes(resp);
                    this.alertService.populateFieldSpecificErrors("mntner", this.mntnerAttributes, resp);
                    this.alertService.addErrors(resp);
                }, (error: any) => {
                    this.alertService.populateFieldSpecificErrors("mntner", this.mntnerAttributes, error.data);
                    this.alertService.addErrors(error.data);
                });
        }
    }
    public navigateToSelect() {
        return this.router.navigate(["webupdates/select"]);
    }

    public navigateToModifyPerson() {
        return this.router.navigateByUrl(`webupdates/modify/${this.objectSource}/person/${this.objectTypeName}?noRedirect`);
    }

    public navigateToModifyMntner() {
        return this.router.navigateByUrl(`webupdates/modify/${this.objectSource}/mntner/${this.mntnerName}?noRedirect`);
    }

    public navigateToSharedMntner() {
        return this.router.navigateByUrl(`webupdates/create/${this.objectSource}/mntner/self?admin=${this.objectTypeName}`)
    }

}
