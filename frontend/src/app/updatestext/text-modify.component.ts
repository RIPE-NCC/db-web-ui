import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { ErrorReporterService } from '../updatesweb/error-reporter.service';
import { MessageStoreService } from '../updatesweb/message-store.service';
import { PreferenceService } from '../updatesweb/preference.service';
import { TextCommonsService } from './text-commons.service';
import { ITextObject } from './text-create.component';

@Component({
    selector: 'text-modify',
    templateUrl: './text-modify.component.html',
    standalone: false,
})
export class TextModifyComponent implements OnInit {
    public restCallInProgress: boolean = false;
    public noRedirect: boolean = false;
    public object: ITextObject = {
        source: '',
        type: '',
    };
    public name: string;
    public override: string;
    public passwords: string[] = [];

    constructor(
        private whoisResourcesService: WhoisResourcesService,
        private errorReporterService: ErrorReporterService,
        private messageStoreService: MessageStoreService,
        private textCommonsService: TextCommonsService,
        private preferenceService: PreferenceService,
        public alertsServices: AlertsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private properties: PropertiesService,
    ) {}

    public ngOnInit() {
        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.object.source = paramMap.get('source') ?? this.properties.SOURCE;
        this.object.type = paramMap.get('objectType');
        this.object.name = decodeURIComponent(paramMap.get('objectName'));
        if (queryParamMap.has('rpsl')) {
            this.object.rpsl = decodeURIComponent(queryParamMap.get('rpsl'));
        }
        const redirect = !queryParamMap.has('noRedirect');

        console.debug(
            'TextModifyController: Url params:' +
                ' object.source:' +
                this.object.source +
                ', object.type:' +
                this.object.type +
                ', object.name:' +
                this.object.name +
                ', noRedirect:' +
                this.noRedirect,
        );

        if (this.preferenceService.isWebMode() && redirect) {
            this.switchToWebMode();
            return;
        }
    }

    public submit(response) {
        if (response.data?.errormessages) {
            this.restCallInProgress = false;

            const whoisResources = response.data;
            this.alertsServices.setAllErrors(whoisResources);
            const attributes = this.whoisResourcesService.getAttributes(whoisResources);
            if (!_.isEmpty(attributes)) {
                this.errorReporterService.log('TextModify', this.object.type, this.alertsServices.alerts.errors, attributes);
            }
        } else {
            this.object.rpsl = response.rpsl;
            this.restCallInProgress = false;
            const primaryKey = this.whoisResourcesService.getPrimaryKey(response);
            this.messageStoreService.add(primaryKey, response);
            this.navigateToDisplayPage(this.object.source, this.object.type, primaryKey, 'Modify');
        }
    }

    public switchToWebMode() {
        console.debug('Switching to web-mode');

        this.preferenceService.setWebMode();
        void this.router.navigateByUrl(`webupdates/modify/${this.object.source}/${this.object.type}/${encodeURIComponent(this.object.name)}?noRedirect`);
    }

    public cancel() {
        this.navigateToDisplayPage(this.object.source, this.object.type, this.object.name, undefined);
    }

    public deleteObject() {
        this.textCommonsService.navigateToDelete(this.object.source, this.object.type, this.object.name, 'textupdates/modify');
    }

    private navigateToDisplayPage(source: string, objectType: string, objectName: string, operation: any) {
        if (operation) {
            void this.router.navigateByUrl(`webupdates/display/${source}/${objectType}/${encodeURIComponent(objectName)}?method=${operation}`);
        } else {
            // operation create or modify was canceled
            void this.router.navigateByUrl(`webupdates/display/${source}/${objectType}/${encodeURIComponent(objectName)}`);
        }
    }
}
