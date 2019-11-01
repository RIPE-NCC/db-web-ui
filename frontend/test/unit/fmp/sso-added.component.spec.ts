import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute} from "@angular/router";
import {SsoAddedComponent} from "../../../src/app/fmp/sso-added.component";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";

describe("SsoAddedComponent", () => {
    let component: SsoAddedComponent;
    let fixture: ComponentFixture<SsoAddedComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule],
            declarations: [
                SsoAddedComponent
            ],
            providers: [
                { provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: (param: string) => ((param === "user") ? "userX": "test@work.net")}}}}
            ],
        });
        fixture = TestBed.createComponent(SsoAddedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should extract email from url params", () => {
        expect(component.user).toBe("userX");
    });
});
