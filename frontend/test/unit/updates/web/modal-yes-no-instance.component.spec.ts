import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {ModalAddAttributeComponent} from "../../../../src/app/updatesweb/modal-add-attribute.component";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {ModalYesNoInstanceComponent} from "../../../../src/app/updatesweb/modal-yes-no-instance.component";

describe("ModalYesNoInstanceComponent", () => {

    let componentFixture: ComponentFixture<ModalYesNoInstanceComponent>;
    let modalYesNoInstanceComponent: ModalYesNoInstanceComponent;
    let modalMock: any;
    beforeEach(() => {
        modalMock = jasmine.createSpyObj("NgbActiveModal", ["close", "dismiss"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [ModalAddAttributeComponent],
            providers: [
                {provide: NgbActiveModal, useValue: modalMock}
            ],
        });
        componentFixture = TestBed.createComponent(ModalYesNoInstanceComponent);
        modalYesNoInstanceComponent = componentFixture.componentInstance;
    });

    it("should close the modal and return yes", async () => {
        modalYesNoInstanceComponent.msg = "message";
        componentFixture.detectChanges();
        modalYesNoInstanceComponent.yes();

        expect(modalMock.close).toHaveBeenCalledWith("yes");
    });

    it("should close the modal when canceled", async () => {
        modalYesNoInstanceComponent.msg = "message";

        componentFixture.detectChanges();
        modalYesNoInstanceComponent.no();

        expect(modalMock.dismiss).toHaveBeenCalled();
    });
});
