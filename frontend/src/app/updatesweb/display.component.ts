import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Subscription, combineLatest } from 'rxjs';
import { AlertsService } from '../shared/alert/alerts.service';
import { SanitizeHtmlPipe } from '../shared/sanitize-html.pipe';
import { WhoisLineDiffDirective } from '../shared/whois-line-diff.directive';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { MessageStoreService } from './message-store.service';
import { RestService } from './rest.service';
import { WebUpdatesCommonsService } from './web-updates-commons.service';

@Component({
    selector: 'display',
    templateUrl: './display.component.html',
    imports: [NgIf, NgFor, WhoisLineDiffDirective, MatButton, SanitizeHtmlPipe],
})
export class DisplayComponent implements OnInit, OnDestroy {
    public objectSource: string;
    public objectType: string;
    public objectName: string;
    public method: string;
    public before: string;
    public after: string;
    public loggedIn: boolean;
    public attributes: any;

    private subscription: Subscription;

    constructor(
        public whoisResourcesService: WhoisResourcesService,
        public messageStoreService: MessageStoreService,
        private restService: RestService,
        private userInfoService: UserInfoService,
        private webUpdatesCommonsService: WebUpdatesCommonsService,
        public alertsService: AlertsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {}

    public ngOnInit() {
        this.subscription = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]).subscribe((params: any) => {
            // extract parameters from the url
            this.objectSource = params[0].source;
            this.objectType = params[0].objectType;
            // url-decode otherwise newly-created resource is MessageStoreService will not be found
            this.objectName = decodeURIComponent(params[0].objectName);
            this.method = params[1].method || undefined; // optional: added by create- and modify-component

            this.init();
        });
    }

    private init() {
        /*
         * Start of initialisation phase
         */
        console.debug(
            'DisplayComponent: Url params: source:' +
                this.objectSource +
                '. objectType:' +
                this.objectType +
                ', objectName:' +
                this.objectName +
                ', method:' +
                this.method,
        );

        this.userInfoService.getUserOrgsAndRoles().subscribe(() => {
            this.loggedIn = true;
        });

        // fetch just created object from temporary store
        const cached = this.messageStoreService.get(this.objectName);
        if (!_.isUndefined(cached)) {
            const whoisResources = this.whoisResourcesService.validateWhoisResources(cached);
            this.attributes = this.whoisResourcesService.getAttributes(whoisResources);
            this.alertsService.populateFieldSpecificErrors(this.objectType, this.attributes, cached);
            this.alertsService.addGlobalSuccesses(`Your object has been successfully ${this.getOperationName()}`);
            this.alertsService.setErrors(whoisResources);

            if (this.method === 'Modify') {
                const diff = this.whoisResourcesService.validateAttributes(this.messageStoreService.get('DIFF'));
                if (!_.isUndefined(diff)) {
                    this.before = this.whoisResourcesService.toPlaintext(diff);
                    this.after = this.whoisResourcesService.toPlaintext(this.attributes);
                }
            }
            this.webUpdatesCommonsService.addLinkToReferenceAttributes(this.attributes, this.objectSource);
        } else {
            this.restService.fetchObject(this.objectSource, this.objectType, this.objectName, null, null).subscribe({
                next: (resp: any) => {
                    this.attributes = this.whoisResourcesService.getAttributes(resp);
                    this.webUpdatesCommonsService.addLinkToReferenceAttributes(this.attributes, this.objectSource);
                    this.alertsService.populateFieldSpecificErrors(this.objectType, this.attributes, resp);
                    this.alertsService.setErrors(resp);
                },
                error: (resp: any) => {
                    this.alertsService.populateFieldSpecificErrors(this.objectType, this.attributes, resp.data);
                    this.alertsService.setErrors(resp.data);
                },
            });
        }
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
    }

    public modifyButtonToBeShown() {
        return this.alertsService && !this.alertsService.hasErrors() && !this.isPending();
    }

    private isPending() {
        return !_.isUndefined(this.method) && this.method === 'Pending';
    }

    public getOperationName(): string {
        return this.method === 'Create' ? 'created' : 'modified';
    }

    public navigateToSelect() {
        return this.router.navigate(['webupdates/select']);
    }

    public navigateToModify() {
        return this.router.navigateByUrl(`webupdates/modify/${this.objectSource}/${this.objectType}/${encodeURIComponent(this.objectName)}`);
    }

    public isDiff() {
        return !_.isUndefined(this.before) && !_.isUndefined(this.after);
    }
}
