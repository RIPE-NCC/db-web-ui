import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { ApiKeysService } from './api-keys.service';
import { CreateNewApiKeyComponent } from './create-new-api-key/create-new-api-key.component';
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
    ],
})
export class ApiKeysComponent implements OnInit {
    private apiKeysService = inject(ApiKeysService);
    private alertsService = inject(AlertsService);
    private properties = inject(PropertiesService);

    displayedColumns: string[] = ['label', 'id', 'lastUsed', 'expiresAt', 'keyType', 'details', 'delete'];
    dataSource: MatTableDataSource<ApiKey>;
    selection = new SelectionModel<ApiKey>(true, []);

    environment: string = this.properties.getTitleEnvironment();
    panelOpenState: boolean = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    readonly revokeDialog = inject(MatDialog);

    ngOnInit(): void {
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
        this.panelOpenState = false;
    }

    private loadTableData() {
        this.apiKeysService.getApiKeys().subscribe({
            next: (apiKeys: ApiKey[]) => {
                this.dataSource = new MatTableDataSource<ApiKey>(apiKeys);
                this.afterViewInit();
            },
            error: () => {
                this.alertsService.addGlobalError('Failed to load data. Please try again later.');
            },
        });
    }
}
