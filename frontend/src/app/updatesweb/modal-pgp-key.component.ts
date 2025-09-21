import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from '../core/core.module';

@Component({
    selector: 'modal-md5-password',
    templateUrl: './modal-pgp-key.component.html',
    standalone: true,
    imports: [CoreModule, MatButton],
})
export class ModalPGPKeyComponent {
    private readonly PGP_HEADER: string = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
    private readonly PGP_FOOTER: string = '-----END PGP PUBLIC KEY BLOCK-----';

    pgpKey: string = '';

    constructor(private activeModal: NgbActiveModal) {}

    ok() {
        if (this.verifyPGP()) {
            this.activeModal.close(this.pgpKey);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

    private verifyPGP(): boolean {
        return this.pgpKey.startsWith(this.PGP_HEADER) && this.pgpKey.endsWith(this.PGP_FOOTER);
    }
}
