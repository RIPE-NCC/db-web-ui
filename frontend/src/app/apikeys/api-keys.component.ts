import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertsService } from '../shared/alert/alerts.service';
import { ApiKeysService } from './api-keys.service';
import { RevokeKeyDialogComponent } from './revoke-key-dialog/revoke-key-dialog.component';
import { ApiKey } from './types';

@Component({
    templateUrl: './api-keys.component.html',
    styleUrl: './api-keys.component.scss',
    standalone: false,
})
export class ApiKeysComponent implements OnInit {
    displayedColumns: string[] = ['label', 'id', 'lastUsed', 'expiresAt', 'details', 'delete'];
    dataSource: MatTableDataSource<ApiKey>;
    selection = new SelectionModel<ApiKey>(true, []);

    panelOpenState: boolean = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    readonly revokeDialog = inject(MatDialog);

    constructor(private apiKeysService: ApiKeysService, private alertsService: AlertsService) {}

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
