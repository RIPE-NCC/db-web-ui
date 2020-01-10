import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {CoreModule} from "../../../../src/app/core/core.module";
import {AttributeInfoComponent} from "../../../../src/app/shared/descriptionsyntax/attr-info.component";

describe("AttributeInfoComponent", () => {
    let component: AttributeInfoComponent;
    let fixture: ComponentFixture<AttributeInfoComponent>;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                SharedModule,
                CoreModule
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(AttributeInfoComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should provide correct description for mnt-by in object inetnum", () => {
        component.objectType = "inetnum";
        component.description = "mnt-by";
        fixture.detectChanges();
        expect(component.text).toEqual(`Specifies one or more maintainers used for authorisation on the object as \"mnt-by:\". Add maintainers by typing in the input field, remove them by clicking the \"x\". Maintainers marked with a star can be used with your RIPE NCC Access SSO account. RIPE NCC maintainers, if present, cannot be removed. <a href=\"https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers\" target=\"_blank\">Learn more.</a>`);
    });

    it("should provide correct syntax for mnt-by in object inetnum", () => {
        component.objectType = "inetnum";
        component.syntax = "mnt-by";
        fixture.detectChanges();
        expect(component.text).toEqual(`Made up of letters, digits, the underscore "_" and hyphen "-". The first character of a name must be a letter, and the last character a letter or digit. Note that <a href="https://tools.ietf.org/html/rfc2622#section-2" target="_blank">certain words are reserved by RPSL</a> and cannot be used.`);
    });

    it("should provide correct description for decr in object autnum", () => {
        component.objectType = "autnum";
        component.description = "remarks";
        fixture.detectChanges();
        expect(component.text).toEqual("Contains remarks.");
    });

    it("should provide correct syntax for mnt-by in object autnum", () => {
        component.objectType = "autnum";
        component.syntax = "remarks";
        fixture.detectChanges();
        expect(component.text).toEqual(`Any free-form text using <a href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1#Codepage_layout" target="_blank">Latin-1 character encoding</a>.`);
    });
});
