import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment-timezone';
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
    standalone: false,
})
export class CreateNewApiKeyComponent implements OnInit {
    @Output()
    created = new EventEmitter();

    apiKeyName: string;
    expiresAt: Date;
    maintainers: { key: string }[] = [{ key: '' }];
    maintainersOptions: IMntByModel[];
    minDate: Date = new Date();
    maxDate: Date = new Date();

    private searchMaintainers = new Subject<string>();

    constructor(private restService: RestService, private apiKeysService: ApiKeysService, public dialog: MatDialog, private alertsService: AlertsService) {}

    ngOnInit(): void {
        this.minDate.setDate(this.minDate.getDate() + 1);
        this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
        this.searchMaintainers
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((input) => this.restService.autocomplete('mnt-by', input, true, ['auth'])),
            )
            .subscribe((options) => {
                this.maintainersOptions = options;
            });
    }

    onInputChange(index: number, value: string) {
        this.searchMaintainers.next(value);
        this.maintainers[index].key = value;
    }

    addMaintainerField() {
        this.maintainers.push({ key: '' });
    }

    removeMaintainerField(index: number) {
        if (this.maintainers.length > 1) {
            this.maintainers.splice(index, 1);
        }
    }

    saveApiKey() {
        this.alertsService.clearAlertMessages();
        const expiresAtFormated = moment(this.expiresAt).tz('Europe/Amsterdam').format('YYYY-MM-DDTHH:mm:ssZ');
        this.apiKeysService
            .saveApiKey(
                this.apiKeyName,
                expiresAtFormated,
                !(this.maintainers.length === 1 && this.maintainers[0].key === '') ? this.maintainers.map((item) => item.key) : undefined,
            )
            .subscribe({
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
        const { id, secretKey } = apiKey;
        this.dialog.open(ApiKeyConfirmationDialogComponent, { data: { id, secretKey } });
    }

    private cleanValuesInInputFields() {
        this.apiKeyName = undefined;
        this.expiresAt = undefined;
        this.maintainers = [{ key: '' }];
    }
}
