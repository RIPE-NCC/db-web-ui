import { Component, inject, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { IUserInfoOrganisation, IUserInfoRegistration } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { PropertiesService } from '../properties.service';
import { ObjectTypesEnum } from '../query/object-types.enum';
import { AlertsService } from '../shared/alert/alerts.service';
import { LabelPipe } from '../shared/label.pipe';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { UserInfoService } from '../userinfo/user-info.service';
import { AlertsDropDownComponent } from './alertsdropdown/alerts-drop-down.component';
import { ApikeysDropdownComponent } from './apikeys-dropdown/apikeys-dropdown.component';
import { IpUsageOfAllResourcesComponent } from './ip-usage-of-all-resources.component';
import { ManageResourcesComponent } from './manage-resources/manage-resources.component';
import { RefreshComponent } from './refresh/refresh.component';
import { ResourceItemComponent } from './resource-item/resource-item.component';
import { IAsnResourceDetails, IIPv4ResourceDetails, IIPv6ResourceDetails, IResourceOverviewResponseModel } from './resource-type.model';
import { ResourcesDataService } from './resources-data.service';

export enum ResourceType {
    RESOURCES = 'My Resources',
    SPONSORED = 'Sponsored Resources',
}

@Component({
    selector: 'resource-component',
    templateUrl: './resources.component.html',
    styleUrl: './resources.component.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButton,
        ManageResourcesComponent,
        AlertsDropDownComponent,
        IpUsageOfAllResourcesComponent,
        LoadingIndicatorComponent,
        ResourceItemComponent,
        RefreshComponent,
        LabelPipe,
        ApikeysDropdownComponent,
        MatTabGroup,
        MatTab,
        MatButtonModule,
        MatButtonToggleModule,
    ],
})
export class ResourcesComponent implements OnDestroy {
    private resourcesDataService = inject(ResourcesDataService);
    private userInfoService = inject(UserInfoService);
    private orgDropDownSharedService = inject(OrgDropDownSharedService);
    private alertsService = inject(AlertsService);
    private properties = inject(PropertiesService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);

    public ipv4Resources: IIPv4ResourceDetails[] = [];
    public ipv6Resources: IIPv6ResourceDetails[] = [];
    public asnResources: IAsnResourceDetails[] = [];
    public selectedOrg: IUserInfoOrganisation; // selection bound to ng-model in widget
    public loading: boolean = false; // true until resources are loaded to tabs
    public reason: string = 'No resources found';
    public explanation =
        'If you hold Provider Independent (PI) resources through a sponsoring LIR and want to view them on this page, your maintainer must be registered in your organisation object in the RIPE Database.';
    public fail: boolean;
    public isRedirectedFromIpAnalyser: boolean = false;
    public lastTab: string;
    public lastTabIndex: number = 0;

    public isShowingSponsored: boolean = false;
    public activeToggleButton = 'resources';
    public showAlerts: boolean = true;
    private subscriptions: any[] = [];
    private subscriptionFetchResources: any;
    public readonly listOfTabs = [ObjectTypesEnum.INETNUM.valueOf(), ObjectTypesEnum.INET6NUM.valueOf(), ObjectTypesEnum.AUT_NUM.valueOf()];

    @ViewChild(AlertsDropDownComponent, { static: true })
    public alertsDropDownComponent: AlertsDropDownComponent;

    constructor() {
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
        const queryParamSub = this.activatedRoute.queryParams.subscribe(() => {
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
        this.activeToggleButton = this.isShowingSponsored ? ResourceType.SPONSORED : ResourceType.RESOURCES;

        this.showTheIpAnalyserBanner();

        this.lastTab = this.activatedRoute.snapshot.queryParamMap.get('type');
        this.lastTabIndex = this.listOfTabs.indexOf(this.lastTab);
        // default show inetnum if lastTab have value different then 'inetnum', 'inet6num', 'aut-num'
        if (!this.listOfTabs.includes(this.lastTab)) {
            this.lastTab = ObjectTypesEnum.INETNUM;
        }
        this.refreshPage();
        this.showAlerts = !this.isShowingSponsored && this.lastTab === ObjectTypesEnum.INETNUM;
    }

    public tabClicked($event: MatTabChangeEvent) {
        this.lastTab = $event.tab.id;
        this.lastTabIndex = $event.tab.position;
        const params = {
            type: this.lastTab,
            sponsored: this.isShowingSponsored,
            ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser,
        };
        void this.router.navigate(['myresources/overview'], { queryParams: params });
    }

    resourcesSponsoredToggleClicked(toggleButtonEvent: MatButtonToggleChange): void {
        if (toggleButtonEvent.value === ResourceType.SPONSORED) {
            this.sponsoredResourcesTabClicked();
        } else {
            this.resourcesTabClicked();
        }
    }

    private sponsoredResourcesTabClicked() {
        if (!this.isShowingSponsored) {
            this.isShowingSponsored = true;
            const params = { type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser };
            void this.router.navigate(['myresources/overview'], { queryParams: params });
        }
    }

    private resourcesTabClicked() {
        if (this.isShowingSponsored) {
            this.isShowingSponsored = false;
            const params = { type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser };
            void this.router.navigate(['myresources/overview'], { queryParams: params });
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
                void this.router.navigate(['query']);
            } else {
                this.fetchResourcesAndPopulatePage();
            }
        }
    }

    public isMemberOrg(): boolean {
        return this.isUserInfoRegistration(this.selectedOrg);
    }

    public navigateToCreateAssignments() {
        void this.router.navigate(['webupdates/create', this.properties.SOURCE, this.lastTab]);
    }

    private isUserInfoRegistration(arg: any): arg is IUserInfoRegistration {
        return !!arg && !!arg.membershipId;
    }

    private showTheIpAnalyserBanner() {
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

    protected readonly ResourceType = ResourceType;
}
