import {Component, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageStoreService} from "../updatesweb/message-store.service";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {AlertsComponent} from "../shared/alert/alerts.component";

@Component({
    selector: "display-domain-objects",
    templateUrl: "./display-domain-objects.component.html",
})
export class DisplayDomainObjectsComponent {
    public source: string;
    public prefix: string;
    public objects: any;

    @ViewChild(AlertsComponent, {static: true})
    private alertsComponent: AlertsComponent;

    constructor(private messageStoreService: MessageStoreService,
                private whoisResourcesService: WhoisResourcesService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
    }

    public ngOnInit() {
        this.source = this.activatedRoute.snapshot.queryParamMap.get("source");

        const result = this.messageStoreService.get("result");
        this.prefix = result.prefix;

        const whoisResources = this.whoisResourcesService.validateWhoisResources(result.whoisResources);
        this.objects = whoisResources.objects.object;

        this.alertsComponent.clearAlertMessages();
        this.alertsComponent.addErrors(whoisResources);
    }

    public navigateToSelect() {
        this.router.navigate(["webupdates/select"]);
    }
}
