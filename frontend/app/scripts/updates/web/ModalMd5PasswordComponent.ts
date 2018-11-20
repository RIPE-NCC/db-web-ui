class ModalMd5PasswordComponent {

    public static $inject = ["CryptService"];

    public password: string = "";
    public passwordAgain: string = "";
    public authPasswordMessage: string = "";

    public close: any;
    public dismiss: any;
    public resolve: any;

    constructor(public CryptService: CryptService) {
    }

    public ok() {
        if (this.verifyAuthDialog()) {
            this.close({$value: this._createAuthMd5Value(),
                });
        }
    }

    public cancel() {
        this.dismiss();
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

    private _createAuthMd5Value() {
        return "MD5-PW " + this.CryptService.crypt(this.password);
    }
}

angular.module("webUpdates").component("modalMd5Password", {
    bindings: {
        close: "&",
        dismiss: "&",
        resolve: "=",
    },
    controller: ModalMd5PasswordComponent,
    templateUrl: "scripts/updates/web/modalMd5Password.html",
});
