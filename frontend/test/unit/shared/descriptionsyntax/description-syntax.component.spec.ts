import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {CoreModule} from "../../../../src/app/core/core.module";
import {DescriptionSyntaxComponent} from "../../../../src/app/shared/descriptionsyntax/description-syntax.component";

describe("DescriptionSyntaxComponent", () => {
    let component: DescriptionSyntaxComponent;
    let fixture: ComponentFixture<DescriptionSyntaxComponent>;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                SharedModule,
                CoreModule
            ]
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(DescriptionSyntaxComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
        component.showComponent = true;
        component.objectType = "inetnum";
        component.attrName = "mnt-by";
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
