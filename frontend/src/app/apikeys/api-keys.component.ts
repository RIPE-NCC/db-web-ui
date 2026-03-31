import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource,
} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { ApiKeysService } from './api-keys.service';
import { CreateNewApiKeyComponent, KeyType } from './create-new-api-key/create-new-api-key.component';
import { ExamplesApiKeysComponent } from './examples-api-keys/examples-api-keys.component';
import { RevokeKeyDialogComponent } from './revoke-key-dialog/revoke-key-dialog.component';
import { ApiKey } from './types';

@Component({
    templateUrl: './api-keys.component.html',
    styleUrl: './api-keys.component.scss',
    standalone: true,
    imports: [
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        CreateNewApiKeyComponent,
        MatTable,
        MatSort,
        MatColumnDef,
        MatHeaderCellDef,
        MatHeaderCell,
        MatCellDef,
        MatCell,
        MatSortHeader,
        MatButton,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MatPaginator,
        DatePipe,
        ExamplesApiKeysComponent,
        LoadingIndicatorComponent,
    ],
})
export class ApiKeysComponent implements OnInit, OnDestroy {
    private activatedRoute = inject(ActivatedRoute);
    private apiKeysService = inject(ApiKeysService);
    private alertsService = inject(AlertsService);
    private properties = inject(PropertiesService);
    private orgDropDownSharedService = inject(OrgDropDownSharedService);

    subscription: Subscription;

    loading: boolean = true;
    displayedColumns: string[] = ['label', 'id', 'lastUsed', 'expiresAt', 'keyType', 'details', 'delete'];
    dataSource: MatTableDataSource<ApiKey>;
    selection = new SelectionModel<ApiKey>(true, []);

    environment: string = this.properties.getTitleEnvironment();
    createPanelOpenState: boolean;
    examplePanelOpenState: boolean;

    initialCreateKeyType?: KeyType;
    selectedOrg: IUserInfoOrganisation;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    readonly revokeDialog = inject(MatDialog);

    constructor() {
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
        this.loadTableData();
    }

    afterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    openRevokeDialog(id: string) {
        const dialogRef = this.revokeDialog.open(RevokeKeyDialogComponent);

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result === true) {
                this.apiKeysService.deleteApiKey(id).subscribe(() => {
                    this.loadTableData();
                });
            }
        });
    }

    createdApiKey() {
        this.loadTableData();
        this.createPanelOpenState = false;
    }

    private loadTableData() {
        this.loading = true;
        this.apiKeysService.getApiKeys().subscribe({
            next: (apiKeys: ApiKey[]) => {
                this.loading = false;
                this.dataSource = new MatTableDataSource<ApiKey>(apiKeys);
                this.afterViewInit();
            },
            error: () => {
                this.loading = false;
                this.alertsService.addGlobalError('Failed to load data. Please try again later.');
            },
        });
    }
}
