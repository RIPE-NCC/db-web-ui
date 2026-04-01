import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { PropertiesService } from '../properties.service';
import { ApiKeysService } from './api-keys.service';
import { CreateNewApiKeyComponent, KeyType } from './create-new-api-key/create-new-api-key.component';
import { ExamplesApiKeysComponent } from './examples-api-keys/examples-api-keys.component';

@Component({
    templateUrl: './api-keys.component.html',
    styleUrl: './api-keys.component.scss',
    standalone: true,
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, CreateNewApiKeyComponent, ExamplesApiKeysComponent],
})
export class ApiKeysComponent implements OnInit, OnDestroy {
    private activatedRoute = inject(ActivatedRoute);
    private apiKeysService = inject(ApiKeysService);
    private properties = inject(PropertiesService);
    private orgDropDownSharedService = inject(OrgDropDownSharedService);

    subscription: Subscription;

    environment: string = this.properties.getTitleEnvironment();
    createPanelOpenState: boolean;
    examplePanelOpenState: boolean;

    initialCreateKeyType?: KeyType;
    selectedOrg: IUserInfoOrganisation;

    linkToManageApiKeysInAccess: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor() {
        const propertiesService = inject(PropertiesService);
        this.linkToManageApiKeysInAccess = propertiesService.LINK_TO_MANAGE_APIKEYS_IN_ACCESS;
        this.subscription = this.orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            this.selectedOrg = selected;
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.initialCreateKeyType = KeyType[this.activatedRoute.snapshot.paramMap.get('apiKeyType')?.toUpperCase()];
        this.createPanelOpenState = this.initialCreateKeyType !== undefined;
        this.selectedOrg = this.orgDropDownSharedService.getSelectedOrg();
    }

    createdApiKey() {
        this.createPanelOpenState = false;
    }
}
