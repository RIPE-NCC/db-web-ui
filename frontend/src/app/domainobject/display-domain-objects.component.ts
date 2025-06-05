import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '../shared/alert/alerts.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { MessageStoreService } from '../updatesweb/message-store.service';

@Component({
    selector: 'display-domain-objects',
    templateUrl: './display-domain-objects.component.html',
    standalone: false,
})
export class DisplayDomainObjectsComponent implements OnInit {
    public source: string;
    public prefix: string;
    public objects: any;

    constructor(
        private messageStoreService: MessageStoreService,
        private whoisResourcesService: WhoisResourcesService,
        private alertsService: AlertsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {}

    public ngOnInit() {
        this.source = this.activatedRoute.snapshot.queryParamMap.get('source');

        const result = this.messageStoreService.get('result');
        this.prefix = result.prefix;

        const whoisResources = this.whoisResourcesService.validateWhoisResources(result.whoisResources);
        this.objects = whoisResources.objects.object;

        this.alertsService.clearAlertMessages();
        this.alertsService.addGlobalSuccesses(`${this.objects.length} object(s) have been successfully created`);
        this.alertsService.addAlertMsgs(whoisResources);
    }

    public navigateToSelect() {
        void this.router.navigate(['webupdates/select']);
    }
}
