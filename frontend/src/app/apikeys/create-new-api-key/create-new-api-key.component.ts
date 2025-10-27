import { NgFor } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
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
    imports: [
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        MatHint,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatSuffix,
        MatDatepicker,
        NgFor,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        MatButton,
    ],
})
export class CreateNewApiKeyComponent implements OnInit {
    private restService = inject(RestService);
    private apiKeysService = inject(ApiKeysService);
    dialog = inject(MatDialog);
    private alertsService = inject(AlertsService);

    @Output()
    created = new EventEmitter();

    apiKeyName: string;
    expiresAt: Date;
    maintainers: { key: string }[] = [{ key: '' }];
    maintainersOptions: IMntByModel[];
    minDate: Date = new Date();
    maxDate: Date = new Date();

    private searchMaintainers = new Subject<string>();

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
