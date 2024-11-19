import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment/moment';
import { Subject, switchMap } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AlertsService } from '../../shared/alert/alerts.service';
import { IMntByModel } from '../../shared/whois-response-type.model';
import { RestService } from '../../updatesweb/rest.service';
import { ApiKeyConfirmationDialogComponent } from '../api-key-confirmation-dialog/api-key-confirmation-dialog.component';
import { ApiKeysService } from '../api-keys.service';
import { ApiKey } from '../types';

@Component({
    selector: 'create-new-api-key',
    templateUrl: './create-new-api-key.component.html',
    styleUrl: './create-new-api-key.component.scss',
})
export class CreateNewApiKeyComponent implements OnInit {
    @Output()
    created = new EventEmitter();

    apiKeyName: string;
    expirationDate: Date;
    maintainer: string;
    maintainers: IMntByModel[];

    private searchMaintainers = new Subject<string>();

    constructor(private restService: RestService, private apiKeysService: ApiKeysService, public dialog: MatDialog, private alertsService: AlertsService) {}

    ngOnInit(): void {
        this.searchMaintainers
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((input) => this.restService.autocomplete('mnt-by', input, true, ['auth'])),
            )
            .subscribe((options) => {
                this.maintainers = options;
            });
    }

    onInputChange() {
        this.searchMaintainers.next(this.maintainer);
    }

    saveApiKey() {
        const expirationDate = moment(this.expirationDate);
        this.apiKeysService.saveApiKey(this.apiKeyName, expirationDate.format('YYYY-MM-DDTHH:mm:ss'), this.maintainer).subscribe({
            next: (response: ApiKey) => {
                this.openConfirmDialog(response);
                this.created.emit();
                this.cleanValuesInInputFields();
            },
            error: (error) => {
                this.alertsService.addGlobalError(error.error.errormessages.errormessage[0].text);
            },
        });
    }

    openConfirmDialog(apiKey: ApiKey) {
        const { accessKey, secretKey } = apiKey;
        this.dialog.open(ApiKeyConfirmationDialogComponent, { data: { accessKey, secretKey } });
    }

    private cleanValuesInInputFields() {
        this.apiKeyName = undefined;
        this.expirationDate = undefined;
        this.maintainer = undefined;
    }
}
