import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {MailSentComponent} from "../../../app/ng/fmp/mail-sent.component";
import {SharedModule} from "../../../app/ng/shared/shared.module";
import {CoreModule} from "../../../app/ng/core/core.module";

describe("MailSentComponent", () => {
    let component: MailSentComponent;
    let fixture: ComponentFixture<MailSentComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule],
            declarations: [
                MailSentComponent
            ],
            providers: [
                { provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: (email: string) => ("test@work.net")}}}}
            ],
        });
        fixture = TestBed.createComponent(MailSentComponent);
        component = fixture.componentInstance;
    });

    it("should extract email from url params", () => {
        fixture.detectChanges();
        expect(component.email).toBe("test@work.net");
    });
});
