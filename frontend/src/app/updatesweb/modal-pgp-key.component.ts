import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from '../core/core.module';

@Component({
    selector: 'modal-md5-password',
    templateUrl: './modal-pgp-key.component.html',
    standalone: true,
    imports: [CoreModule, MatButton],
})
export class ModalPGPKeyComponent implements AfterViewInit {
    private readonly PGP_HEADER: string = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
    private readonly PGP_FOOTER: string = '-----END PGP PUBLIC KEY BLOCK-----';
    private readonly X509_HEADER: string = '-----BEGIN CERTIFICATE-----';
    private readonly X509_FOOTER: string = '-----END CERTIFICATE-----';

    pgpKey: string = '';
    validPgp: boolean = true;

    @ViewChild('pgpCtrl') pgpCtrl!: NgModel;

    constructor(private activeModal: NgbActiveModal) {}

    ngAfterViewInit() {
        this.pgpCtrl.valueChanges?.subscribe(() => {
            this.validPgp = true;
        });
    }

    submit() {
        const pgpKeyTrimmed = this.pgpKey.trim();
        if (this.verifyPGP(pgpKeyTrimmed)) {
            this.activeModal.close(pgpKeyTrimmed);
        } else {
            this.validPgp = false;
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

    private verifyPGP(pgpKey: string): boolean {
        return (
            (pgpKey.startsWith(this.PGP_HEADER) && pgpKey.endsWith(this.PGP_FOOTER)) ||
            (pgpKey.startsWith(this.X509_HEADER) && pgpKey.endsWith(this.X509_FOOTER))
        );
    }
}
