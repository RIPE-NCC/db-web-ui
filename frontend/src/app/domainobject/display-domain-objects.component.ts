import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '../shared/alert/alerts.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { MessageStoreService } from '../updatesweb/message-store.service';

@Component({
    selector: 'display-domain-objects',
    templateUrl: './display-domain-objects.component.html',
    imports: [NgFor, NgIf, MatButton, SlicePipe],
})
export class DisplayDomainObjectsComponent implements OnInit {
    private messageStoreService = inject(MessageStoreService);
    private whoisResourcesService = inject(WhoisResourcesService);
    private alertsService = inject(AlertsService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);

    public source: string;
    public prefix: string;
    public objects: any;

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
