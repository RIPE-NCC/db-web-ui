import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageStoreService} from "../updates/message-store.service";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {AlertsService} from "../shared/alert/alerts.service";

@Component({
    selector: "display-domain-objects",
    templateUrl: "./display-domain-objects.component.html",
})
export class DisplayDomainObjectsComponent {
    public source: string;
    public prefix: string;
    public objects: any;

    constructor(private messageStoreService: MessageStoreService,
                private whoisResourcesService: WhoisResourcesService,
                private alertService: AlertsService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
    }

    public ngOnInit() {
        this.source = this.activatedRoute.snapshot.queryParamMap.get("source");

        const result = this.messageStoreService.get("result");
        this.prefix = result.prefix;

        const whoisResources = this.whoisResourcesService.validateWhoisResources(result.whoisResources);
        this.objects = whoisResources.objects.object;

        this.alertService.clearErrors();
        this.alertService.addErrors(whoisResources);
    }

    public navigateToSelect() {
        this.router.navigate(["webupdates/select"]);
    }
}
