import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { createPopup } from '@typeform/embed';

@Component({
    selector: 'typeform-dialog',
    templateUrl: 'typeform-dialog.component.html',
    styleUrl: 'typeform-dialog.component.scss',
    standalone: true,
})
export class TypeformDialogComponent implements OnInit {
    private dialogRef = inject<MatDialogRef<TypeformDialogComponent>>(MatDialogRef);

    ngOnInit() {
        createPopup('sFTT41YW', {
            container: document.getElementById('tf-popover'),
            open: 'load',
            height: '100%',
            width: '100%',
            hideFooter: true,
            iframeProps: {
                width: '100%',
            },
            onClose: () => this.close(),
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
