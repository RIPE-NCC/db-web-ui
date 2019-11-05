import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {ModalAddAttributeComponent} from "../../../../src/app/updates/web/modal-add-attribute.component";
import {SharedModule} from "../../../../src/app/shared/shared.module";

describe("ModalAddAttributeComponent", () => {

    let componentFixture: ComponentFixture<ModalAddAttributeComponent>;
    let modalAddAttributeComponent: ModalAddAttributeComponent;
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
        componentFixture = TestBed.createComponent(ModalAddAttributeComponent);
        modalAddAttributeComponent = componentFixture.componentInstance;
    });

    it("should close the modal and return selected item when ok", async () => {
        modalAddAttributeComponent.items = [ {name:"a"}, {name:"b"} ];
        componentFixture.detectChanges();
        modalAddAttributeComponent.selected = {name:"b"};
        modalAddAttributeComponent.ok();

        expect(modalMock.close).toHaveBeenCalledWith({name:"b"});
    });

    it("should close the modal and return error when canceled", async () => {
        modalAddAttributeComponent.items = [ {name:"a"}, {name:"b"} ];

        componentFixture.detectChanges();
        modalAddAttributeComponent.selected = "b";
        modalAddAttributeComponent.cancel();

        expect(modalMock.dismiss).toHaveBeenCalled();
    });
});
