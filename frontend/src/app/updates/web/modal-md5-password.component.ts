import {Component} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {CryptService} from "./crypt.service";

@Component({
    selector: "modal-md5-password",
    templateUrl: "./modal-md5-password.component.html",
})
export class ModalMd5PasswordComponent {

    public password: string = "";
    public passwordAgain: string = "";
    public authPasswordMessage: string = "";

    constructor(private activeModal: NgbActiveModal,
                private cryptService: CryptService) {
    }

    public ok() {
        if (this.verifyAuthDialog()) {
            this.activeModal.close(this.createAuthMd5Value());
        }
    }

    public cancel() {
        this.activeModal.dismiss();
    }

    public verifyAuthDialog() {
        if (this.password.length ===   0) {
            this.authPasswordMessage = "Password too short!";
            return false;
        } else if (this.password !== this.passwordAgain) {
            this.authPasswordMessage = "Passwords do not match!";
            return false;
        } else {
            this.authPasswordMessage = "Passwords match!";
            return true;
        }
    }

    private createAuthMd5Value() {
        return "MD5-PW " + this.cryptService.crypt(this.password);
    }
}
