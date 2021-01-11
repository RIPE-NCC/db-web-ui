import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {FormsModule} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {CryptService} from "../../../../src/app/updatesweb/crypt.service";
import {ModalMd5PasswordComponent} from "../../../../src/app/updatesweb/modal-md5-password.component";

describe("ModalMd5PasswordComponent", () => {

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalMd5PasswordComponent>;
    let modalMd5PasswordComponent: ModalMd5PasswordComponent;
    let modalMock: any;


    beforeEach(() => {
        modalMock = jasmine.createSpyObj("NgbActiveModal", ["close", "dismiss"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [ModalMd5PasswordComponent],
            providers: [
                {provide: NgbActiveModal, useValue: modalMock},
                CryptService,
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalMd5PasswordComponent);
        modalMd5PasswordComponent = componentFixture.componentInstance;
    });

    afterEach(function() {
        httpMock.verify()
    });

    it("should close the modal and return selected md5 value when ok", () => {
        modalMd5PasswordComponent.password = "123";
        modalMd5PasswordComponent.passwordAgain = "123";
        componentFixture.detectChanges();
        modalMd5PasswordComponent.ok();
        expect(modalMock.close).toHaveBeenCalled( ); // md5 hash is unpredictable
    });

    it("should report error when passwords are empty", () => {
        modalMd5PasswordComponent.password = "";
        modalMd5PasswordComponent.passwordAgain = "";
        componentFixture.detectChanges();

        modalMd5PasswordComponent.ok();
        expect(modalMd5PasswordComponent.authPasswordMessage).toEqual("Password too short!");
    });

    it("should report error when passwords are not equal", () => {
        modalMd5PasswordComponent.password = "123";
        modalMd5PasswordComponent.passwordAgain = "1234";
        componentFixture.detectChanges();

        modalMd5PasswordComponent.ok();
        expect(modalMd5PasswordComponent.authPasswordMessage).toEqual("Passwords do not match!");
    });

    it("should report error the modal and return error when cancelled", () => {
        componentFixture.detectChanges();

        modalMd5PasswordComponent.cancel();
        expect(modalMock.dismiss).toHaveBeenCalled();
    });
});

