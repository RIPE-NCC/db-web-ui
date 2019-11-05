import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute} from "@angular/router";
import {of} from "rxjs";

import {EmailConfirmationComponent} from "../../../src/app/emailconfirmation/email-confirmation.component";
import {EmailConfirmationService} from "../../../src/app/emailconfirmation/email-confirmation.service";
import {LoadingIndicatorComponent} from "../../../src/app/shared/loading-indicator/loading-indicator.component";
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";

describe("Testing EmailConfirmation with logged in user", () => {
    const url = "api/whois-internal/api/abuse-validation/validate-token?token=123456789012345678";

    let component: EmailConfirmationComponent;
    let fixture: ComponentFixture<EmailConfirmationComponent>;
    let httpMock: HttpTestingController;
    let service: EmailConfirmationService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                EmailConfirmationComponent,
                LoadingIndicatorComponent,
            ],
            providers: [
                EmailConfirmationService,
                { provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: { get: (t: string) => ("123456789012345678")}}}},
                { provide: UserInfoService, useValue: {data: of(200)}},
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EmailConfirmationComponent);
        httpMock = TestBed.get(HttpTestingController);
        service = TestBed.get(EmailConfirmationService);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component.loading).toEqual(true);
        expect(component.validEmail).toEqual(false);
        expect(component.token).toEqual("123456789012345678");
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should show invalid link page", () => {
        const req = httpMock.expectOne({method: "GET", url});
        req.flush(null, {status: 403, statusText: ""});
        expect(component.loading).toEqual(false);
        expect(component.validEmail).toEqual(false);
    });

    it("should show confirmation page", () => {
        const req = httpMock.expectOne({method: "GET", url});
        req.flush(mockSuccessResponse.data);
        expect(component.loading).toEqual(false);
        expect(component.validEmail).toEqual(true);
    });
});

describe("Testing EmailConfirmation with not logged in user", () => {
    const url = "api/whois-internal/api/abuse-validation/validate-token?token=123456789012345678";
    const token = "123456789012345678";

    let component: EmailConfirmationComponent;
    let fixture: ComponentFixture<EmailConfirmationComponent>;
    let httpMock: HttpTestingController;
    let service: EmailConfirmationService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                EmailConfirmationComponent,
                LoadingIndicatorComponent,
            ],
            providers: [
                EmailConfirmationService,
                { provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: { get: (t: string) => ("123456789012345678")}}}},
                { provide: UserInfoService, useValue: {data: of(200)}},
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EmailConfirmationComponent);
        httpMock = TestBed.get(HttpTestingController);
        service = TestBed.get(EmailConfirmationService);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component.loading).toEqual(true);
        expect(component.validEmail).toEqual(false);
        expect(component.token).toEqual("123456789012345678");
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should show invalid link page", () => {
        const req = httpMock.expectOne({method: "GET", url});
        req.flush(null, {status: 403, statusText: ""});
        expect(component.loading).toEqual(false);
        expect(component.validEmail).toEqual(false);
    });

    it("should show confirmation page", () => {
        const req = httpMock.expectOne({method: "GET", url});
        req.flush(mockSuccessResponse.data);
        expect(component.loading).toEqual(false);
        expect(component.validEmail).toEqual(true);
    });
});

const mockSuccessResponse = {
    requestUrl: "/api/whois-internal/api/abuse-validation/validate-token?token=123456789012345678",
    contentType: "application/javascript",
    statusCode: 200,
    data: {},
};
