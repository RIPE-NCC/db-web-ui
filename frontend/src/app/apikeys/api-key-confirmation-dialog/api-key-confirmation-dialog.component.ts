import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
    selector: 'api-key-confirmation-dialog',
    templateUrl: 'api-key-confirmation-dialog.component.html',
    styleUrl: 'api-key-confirmation-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, MatDialogContent, MatCard, MatCardContent, MatButton, CdkCopyToClipboard, MatDialogActions, MatDialogClose],
})
export class ApiKeyConfirmationDialogComponent {
    data = inject(MAT_DIALOG_DATA);

    protected readonly btoa = btoa;

    public getBasicAuthorizationHeader(username: string, password: string) {
        return `Authorization: Basic ${this.encodeUsernamePassword(username, password)}`;
    }

    private encodeUsernamePassword(username: string, password: string) {
        return btoa(`${username}:${password}`);
    }
}
