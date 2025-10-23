import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { CommonModule, NgForOf } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
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
} from '@angular/material/table';
import { CoreModule } from '../core/core.module';
import { ApiKeyConfirmationDialogComponent } from './api-key-confirmation-dialog/api-key-confirmation-dialog.component';
import { ApiKeysComponent } from './api-keys.component';
import { ApiKeysService } from './api-keys.service';
import { CreateNewApiKeyComponent } from './create-new-api-key/create-new-api-key.component';
import { RevokeKeyDialogComponent } from './revoke-key-dialog/revoke-key-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatTable,
        MatCheckbox,
        MatColumnDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatHeaderCellDef,
        MatCellDef,
        MatRowDef,
        MatHeaderRowDef,
        MatButton,
        MatExpansionModule,
        MatAccordion,
        MatFormField,
        MatFormFieldModule,
        MatInput,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatDatepicker,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        CoreModule,
        NgForOf,
        MatPaginator,
        MatSort,
        MatSortModule,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle,
        MatCard,
        MatCardContent,
        CdkCopyToClipboard,
        MatAnchor,
        MatCardHeader,
        ApiKeysComponent,
        CreateNewApiKeyComponent,
        RevokeKeyDialogComponent,
        ApiKeyConfirmationDialogComponent,
    ],
    providers: [provideNativeDateAdapter(), ApiKeysService],
})
export class ApiKeysModule {}
