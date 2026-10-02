import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatSuffix } from '@angular/material/input';
import { MatTab, MatTabChangeEvent, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NodeHealthStatus } from 'src/app/myresources/health-check-card/node-health.model';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { NodePreviewComponent } from 'src/app/myresources/tree/node-preview.component';
import { Tree, TreeNode } from 'src/app/myresources/tree/tree.component';
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
import { IResourceOverviewResponseModel, IResourceScreenItem } from './resource-type.model';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatButton,
        ManageResourcesComponent,
        IpUsageOfAllResourcesComponent,
        LoadingIndicatorComponent,
        RefreshComponent,
        LabelPipe,
        ApikeysDropdownComponent,
        MatTabGroup,
        MatTab,
        MatButtonModule,
        MatButtonToggleModule,
        Tree,
        NodePreviewComponent,
        MatTabLabel,
        MatSuffix,
        MatIcon,
    ],
})
export class ResourcesComponent implements OnDestroy {
    private resourcesDataService = inject(ResourcesDataService);
    private userInfoService = inject(UserInfoService);
    private orgDropDownSharedService = inject(OrgDropDownSharedService);
    private alertsService = inject(AlertsService);
    private properties = inject(PropertiesService);
    private activatedRoute = inject(ActivatedRoute);
    private nodeHealthService = inject(NodeHealthService);
    private router = inject(Router);

    ipv4Resources: IResourceScreenItem[] = [];
    ipv6Resources: IResourceScreenItem[] = [];
    asnResources: IResourceScreenItem[] = [];
    selectedOrg: IUserInfoOrganisation; // selection bound to ng-model in widget
    loading: boolean = false; // true until resources are loaded to tabs
    reason: string = 'No resources found';
    explanation =
        'If you hold Provider Independent (PI) resources through a sponsoring LIR and want to view them on this page, your maintainer must be registered in your organisation object in the RIPE Database.';
    fail: boolean;
    isRedirectedFromIpAnalyser: boolean = false;
    lastTab: string;
    lastTabIndex: number = 0;

    isShowingSponsored: boolean = false;
    activeToggleButton = 'resources';

    selectedTreeNode = signal<TreeNode | undefined>(undefined);
    showNodePreview: boolean = true;
    readonly listOfTabs = [ObjectTypesEnum.INETNUM.valueOf(), ObjectTypesEnum.INET6NUM.valueOf(), ObjectTypesEnum.AUT_NUM.valueOf()];
    readonly hasIpv4Issues = computed(
        () => this.nodeHealthService.nodes()[ObjectTypesEnum.INETNUM]?.some((node) => node.healthStatus() === NodeHealthStatus.ISSUES) ?? false,
    );

    readonly hasIpv6Issues = computed(
        () => this.nodeHealthService.nodes()[ObjectTypesEnum.INET6NUM]?.some((node) => node.healthStatus() === NodeHealthStatus.ISSUES) ?? false,
    );

    readonly hasAsnIssues = computed(
        () => this.nodeHealthService.nodes()[ObjectTypesEnum.AUT_NUM]?.some((node) => node.healthStatus() === NodeHealthStatus.ISSUES) ?? false,
    );

    private subscriptions: any[] = [];
    private subscriptionFetchResources: any;

    @ViewChild(AlertsDropDownComponent, { static: true })
    alertsDropDownComponent: AlertsDropDownComponent;

    constructor() {
        const orgSub = this.orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            if (this.selectedOrg?.orgObjectId !== selected.orgObjectId) {
                this.nodeHealthService.reset();
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

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
        this.subscriptionFetchResources.unsubscribe();
    }

    init() {
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
    }

    tabClicked($event: MatTabChangeEvent) {
        this.selectedTreeNode.set(undefined);
        this.lastTab = $event.tab.id;
        this.lastTabIndex = $event.index;

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

    onTreeNodeSelected(node: TreeNode): void {
        this.selectedTreeNode.set({ ...node });
    }

    private sponsoredResourcesTabClicked() {
        if (!this.isShowingSponsored) {
            this.nodeHealthService.reset();
            this.isShowingSponsored = true;
            const params = { type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser };
            void this.router.navigate(['myresources/overview'], { queryParams: params });
        }
    }

    private resourcesTabClicked() {
        if (this.isShowingSponsored) {
            this.nodeHealthService.reset();
            this.isShowingSponsored = false;
            const params = { type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: '' + this.isRedirectedFromIpAnalyser };
            void this.router.navigate(['myresources/overview'], { queryParams: params });
        }
    }

    refreshPage() {
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

    isMemberOrg(): boolean {
        return this.isUserInfoRegistration(this.selectedOrg);
    }

    navigateToCreateAssignments() {
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

        const orgId = this.selectedOrg.orgObjectId;
        const selectedType = this.lastTab as ObjectTypesEnum;
        const sponsored = this.isShowingSponsored;

        this.loading = true;

        this.subscriptionFetchResources = this.resourcesDataService
            .getResources(orgId, selectedType, sponsored)
            .pipe(
                tap((response: IResourceOverviewResponseModel) => {
                    this.setResources(selectedType, response.resources);

                    // First/selected tab is ready
                    this.loading = false;
                }),
                switchMap(() => {
                    const remainingTypes = [ObjectTypesEnum.INETNUM, ObjectTypesEnum.INET6NUM, ObjectTypesEnum.AUT_NUM].filter((type) => type !== selectedType);

                    return forkJoin(
                        remainingTypes.map((type) =>
                            this.resourcesDataService.getResources(orgId, type, sponsored).pipe(
                                tap((response) => this.setResources(type, response.resources)),
                                catchError((error) => {
                                    console.error(`Failed to load ${type}`, error);
                                    return of(null);
                                }),
                            ),
                        ),
                    );
                }),
            )
            .subscribe({
                error: (error: any) => {
                    if (error.status !== 401 && error.status !== 403) {
                        this.fail = true;
                        this.loading = false;
                        this.reason = 'There was problem reading resources please try again';
                    }
                },
            });
    }

    private setResources(type: ObjectTypesEnum, resources: IResourceScreenItem[]): void {
        switch (type) {
            case ObjectTypesEnum.INETNUM:
                this.ipv4Resources = resources;
                break;

            case ObjectTypesEnum.INET6NUM:
                this.ipv6Resources = resources;
                break;

            case ObjectTypesEnum.AUT_NUM:
                this.asnResources = resources;
                break;

            default:
                this.fail = true;
                this.reason = 'There was problem reading resources please try again';
                console.error('Error. Wrong resource type:', type);
        }
    }

    protected readonly ResourceType = ResourceType;
    protected readonly ObjectTypesEnum = ObjectTypesEnum;
}
