import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { IUserInfoOrganisation, IUserInfoRegistration } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { PropertiesService } from '../properties.service';
import { ObjectTypesEnum } from '../query/object-types.enum';
import { AlertsService } from '../shared/alert/alerts.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { AlertsDropDownComponent } from './alertsdropdown/alerts-drop-down.component';
import { IAsnResourceDetails, IIPv4ResourceDetails, IIPv6ResourceDetails, IResourceOverviewResponseModel } from './resource-type.model';
import { ResourcesDataService } from './resources-data.service';

@Component({
    selector: 'resource-component',
    templateUrl: './resources.component.html',
})
export class ResourcesComponent implements OnDestroy {
    public ipv4Resources: IIPv4ResourceDetails[] = [];
    public ipv6Resources: IIPv6ResourceDetails[] = [];
    public asnResources: IAsnResourceDetails[] = [];
    public selectedOrg: IUserInfoOrganisation; // selection bound to ng-model in widget
    public loading: boolean = false; // true until resources are loaded to tabs
    public reason: string = 'No resources found';
    public fail: boolean;
    public isRedirectedFromIpAnalyser: boolean = false;
    public lastTab: string;

    public isShowingSponsored: boolean = false;
    public activeSponsoredTab = 0;
    public showAlerts: boolean = true;
    private subscriptions: any[] = [];
    private subscriptionFetchResources: any;
    private readonly listOfTabs = [ObjectTypesEnum.INETNUM.valueOf(), ObjectTypesEnum.INET6NUM.valueOf(), ObjectTypesEnum.AUT_NUM.valueOf()];

    @ViewChild(AlertsDropDownComponent, { static: true })
    public alertsDropDownComponent: AlertsDropDownComponent;

    constructor(
        private resourcesDataService: ResourcesDataService,
        private userInfoService: UserInfoService,
        private orgDropDownSharedService: OrgDropDownSharedService,
        private alertsService: AlertsService,
        private properties: PropertiesService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {
        const orgSub = this.orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            if (this.selectedOrg?.orgObjectId !== selected.orgObjectId) {
                this.selectedOrg = selected;
                this.loading = true;
                if (!this.isMemberOrg() && this.isShowingSponsored) {
                    this.resourcesTabClicked();
                } else {
                    // go back to the start "My Resources" page
                    this.refreshPage();
                }
            }
        });
        const queryParamSub = this.activatedRoute.queryParams.subscribe((params) => {
            this.init();
        });
        this.subscriptions.push(orgSub);
        this.subscriptions.push(queryParamSub);
    }

    public ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    public init() {
        this.isShowingSponsored = this.activatedRoute.snapshot.queryParamMap.get('sponsored') === 'true';
        this.activeSponsoredTab = this.isShowingSponsored ? 1 : 0;

        this.showTheIpAnalyserBanner(this.activatedRoute.snapshot.queryParamMap.get('ipanalyserRedirect') === 'true');

        this.lastTab = this.activatedRoute.snapshot.queryParamMap.get('type');
        // default show inetnum if lastTab have value different then 'inetnum', 'inet6num', 'aut-num'
        if (!this.listOfTabs.includes(this.lastTab)) {
            this.lastTab = ObjectTypesEnum.INETNUM;
        }
        this.refreshPage();
        this.showAlerts = !this.isShowingSponsored && this.lastTab === ObjectTypesEnum.INETNUM;
    }

    public tabClicked($event: NgbNavChangeEvent) {
        if ($event.activeId !== $event.nextId) {
            this.lastTab = $event.nextId;
            const params = { type: $event.nextId, sponsored: this.isShowingSponsored, ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser };
            this.router.navigate(['myresources/overview'], { queryParams: params });
        }
    }

    public sponsoredResourcesTabClicked() {
        if (!this.isShowingSponsored) {
            this.isShowingSponsored = true;
            const params = { type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser };
            this.router.navigate(['myresources/overview'], { queryParams: params });
        }
    }

    public resourcesTabClicked() {
        if (this.isShowingSponsored) {
            this.isShowingSponsored = false;
            const params = { type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser };
            this.router.navigate(['myresources/overview'], { queryParams: params });
        }
    }

    public refreshPage() {
        if (!this.selectedOrg) {
            this.userInfoService.getSelectedOrganisation().subscribe((org: IUserInfoOrganisation) => {
                this.selectedOrg = org;
                this.fetchResourcesAndPopulatePage();
            });
        } else {
            if (this.selectedOrg.roles.indexOf('guest') > -1) {
                this.router.navigate(['query']);
            } else {
                this.fetchResourcesAndPopulatePage();
            }
        }
    }

    public isMemberOrg(): boolean {
        return this.isUserInfoRegistration(this.selectedOrg);
    }

    public navigateToCreateAssignments() {
        this.router.navigate(['webupdates/create', this.properties.SOURCE, this.lastTab]);
    }

    private isUserInfoRegistration(arg: any): arg is IUserInfoRegistration {
        return !!arg && !!arg.membershipId;
    }

    private showTheIpAnalyserBanner(ipanalyserRedirect: boolean) {
        const redirect: boolean = this.activatedRoute.snapshot.queryParamMap.get('ipanalyserRedirect') === 'true';

        this.isRedirectedFromIpAnalyser = redirect;

        // this is to prevent the annoying banner every time (we probably
        // want to remove this logic and show the banner all the time)
        const item = 'shown';
        if (redirect) {
            const shown = localStorage.getItem(item);
            if (shown !== item) {
                this.alertsService.setGlobalInfo(
                    `Looking for analytics on your IP resource allocation and/or assignments? You can find this now in “My Resources”.`,
                );
                localStorage.setItem(item, item);
            }
        }
    }

    private fetchResourcesAndPopulatePage() {
        this.ipv4Resources = this.ipv6Resources = this.asnResources = [];
        if (!this.selectedOrg) {
            return;
        }
        // in case organisation was changed, unsubscribe from fetching resources for previously selected org
        if (this.subscriptionFetchResources) {
            this.subscriptionFetchResources.unsubscribe();
        }
        this.loading = true;
        this.subscriptionFetchResources = this.resourcesDataService
            .fetchResources(this.selectedOrg.orgObjectId, this.lastTab, this.isShowingSponsored)
            .subscribe({
                next: (response: IResourceOverviewResponseModel) => {
                    this.loading = false;
                    switch (this.lastTab) {
                        case ObjectTypesEnum.INETNUM:
                            this.ipv4Resources = response.resources;
                            break;
                        case ObjectTypesEnum.INET6NUM:
                            this.ipv6Resources = response.resources;
                            break;
                        case ObjectTypesEnum.AUT_NUM:
                            this.asnResources = response.resources;
                            break;
                        default:
                            this.fail = true;
                            this.reason = 'There was problem reading resources please try again';
                            console.error('Error. lastTab have wrong value');
                    }
                },
                error: (error: any) => {
                    // if it's not authentication error
                    if (error.status !== 401 && error.status !== 403) {
                        this.fail = true;
                        this.loading = false;
                        this.reason = 'There was problem reading resources please try again';
                    }
                },
            });
    }
}
