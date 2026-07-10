import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { PropertiesService } from '../properties.service';
import { CreateNewApiKeyComponent } from './create-new-api-key/create-new-api-key.component';
import { ExamplesApiKeysComponent } from './examples-api-keys/examples-api-keys.component';
import { KeyType } from './utils';

@Component({
    templateUrl: './api-keys.component.html',
    styleUrl: './api-keys.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, CreateNewApiKeyComponent, ExamplesApiKeysComponent],
})
export class ApiKeysComponent implements OnInit, OnDestroy {
    private activatedRoute = inject(ActivatedRoute);
    private properties = inject(PropertiesService);
    private orgDropDownSharedService = inject(OrgDropDownSharedService);

    subscription: Subscription;

    environment: string = this.properties.getTitleEnvironment();
    createPanelOpenState: boolean = false;
    examplePanelOpenState: boolean = false;

    initialCreateKeyType?: KeyType;
    selectedOrg: IUserInfoOrganisation | undefined;

    linkToManageApiKeysInAccess: string;

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
        const apiKeyType = this.activatedRoute.snapshot.paramMap.get('apiKeyType');

        this.initialCreateKeyType = apiKeyType ? KeyType[apiKeyType.toUpperCase() as keyof typeof KeyType] : undefined;
        this.createPanelOpenState = this.initialCreateKeyType !== undefined;
        this.selectedOrg = this.orgDropDownSharedService.getSelectedOrg();
    }

    createdApiKey() {
        this.createPanelOpenState = false;
    }
}
