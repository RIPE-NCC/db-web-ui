import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'revoke-key-dialog',
    templateUrl: 'revoke-key-dialog.component.html',
    styleUrl: 'revoke-key-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevokeKeyDialogComponent {}
