import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";
import {CookieService} from "ngx-cookie-service";
import {IUserInfoOrganisation, IUserInfoRegistration, IUserInfoResponseData} from "../../../app/ng/dropdown/org-data-type.model";
import {UserInfoService} from "../../../app/ng/userinfo/user-info.service";

describe("UserInfoService", () => {

    let userInfoService: UserInfoService;
    let cookies: CookieService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserInfoService,
                CookieService,
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        userInfoService = TestBed.get(UserInfoService);
        cookies = TestBed.get(CookieService);
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(userInfoService).toBeTruthy();
    });

    it("should provide user info on success", () => {
        userInfoService.getUserOrgsAndRoles()
            .subscribe((respons: IUserInfoResponseData) => {
                expect(respons).toBe(userInfo);
            });
        const req = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"});
        expect(req.request.method).toBe("GET");
        req.flush(userInfo);
    });

    it("should not provide user-info on failure", () => {
        userInfoService.getSelectedOrganisation()
            .subscribe((result: IUserInfoOrganisation) => {
                // NOT to be called
                expect(true).toBe(false);
            }, (error) => {
                expect(error.status).toBe(401);
            });
        const req = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"});
        expect(req.request.method).toBe("GET");
        req.flush(null, {status: 401, statusText: ""});
    });

    it("should handle illegal selectedOrg value from cookie", () => {
        cookies.set("activeMembershipId", "unparseableValue", 1, "/", ".ripe.net", true);
        userInfoService.getSelectedOrganisation()
            .subscribe((result: IUserInfoRegistration) => {
                // first lir in the list should have been automatically selected:
                expect(result.membershipId).toEqual("7347");
            });
        const req = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"});
        expect(req.request.method).toBe("GET");
        req.flush(userInfo);
    });

    it("should preselect correct lir based on cookie activeMembershipId value", () => {
        cookies.set("activeMembershipId", "3629", 1, "/", ".ripe.net", true);
        userInfoService.getSelectedOrganisation()
            .subscribe((result: IUserInfoOrganisation) => {
                expect(result.organisationName).toBe("Internet Provider BV");
            });
        const req = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/user/info"});
        expect(req.request.method).toBe("GET");
        req.flush(userInfo);
    });
});

const userInfo: IUserInfoResponseData = {
    user: {
        "username": "test@ripe.net",
        "displayName": "Test User",
        "uuid": "aaaa-bbbb-cccc-dddd",
        "active": true
    },
    members: [
        {
            "membershipId": "7347",
            "regId": "zz.example",
            "orgObjectId": "ORG-EIP1-RIPE",
            "organisationName": "Internet Provider BV",
            "roles": [
                "admin",
                "general",
                "generalMeeting",
                "resources",
                "certification",
                "ticketing",
                "billing",
                "LIR"
            ],
            lir: true
        },
        {
            "membershipId": "3629",
            "regId": "nl.surfnet",
            "orgObjectId": "ORG-Sb3-RIPE",
            "organisationName": "SURFnet bv",
            "roles": [
                "admin",
                "general",
                "generalMeeting",
                "resources",
                "certification",
                "ticketing",
                "billing",
                "LIR"
            ],
            lir: true
        }
    ],
    organisations: []
};
