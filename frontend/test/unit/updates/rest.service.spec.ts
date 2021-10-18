import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Router} from "@angular/router";
import {of} from "rxjs";
import {RestService} from "../../../src/app/updatesweb/rest.service";
import {SharedModule} from "../../../src/app/shared/shared.module";

describe("RestService", () => {

    let httpMock: HttpTestingController;
    let restService: RestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, HttpClientTestingModule],
            providers: [
                RestService,
                { provide: "WhoisResources", useValue: {wrapError: (error: string) => error, wrapSuccess: (success: string) => success}},
                { provide: Router, useValue: {navigateByUrl:() => {}, events: of()}}
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        restService = TestBed.inject(RestService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should send a http delete when deleting an object", () => {
        const source = "ripe";
        const objectType = "MNT";
        const name = "TEST-MNT";
        const reason = "testing";

        restService.deleteObject(source, objectType, name, reason, false, "password")
            .subscribe((resp) => {
                expect(resp).toBe("deleted");
        });
        const req = httpMock.expectOne({method: "DELETE", url: "api/whois/RIPE/MNT/TEST-MNT?dry-run=false&reason=testing&password=password"});
        expect(req.request.method).toBe("DELETE");
        req.flush("deleted");
    });

    it("should send a http delete when deleting an object with references", () => {
        const source = "ripe";
        const objectType = "MNT";
        const name = "TEST-MNT";
        const reason = "testing";

        restService.deleteObject(source, objectType, name, reason, true, "password")
            .subscribe((resp) => {
                expect(resp).toBe("deleted");
            });
        const req = httpMock.expectOne({method: "DELETE", url: "api/references/RIPE/MNT/TEST-MNT?dry-run=false&reason=testing&password=password"});
        expect(req.request.method).toBe("DELETE");
        req.flush("deleted");
    });

    it("should send a http get when requesting references", () => {
        const source = "RIPE";
        const objectType = "MNT";
        const name = "TEST-MNT";

        restService.getReferences(source, objectType, name, "2")
            .then((resp) => {
                expect(resp).toBe(3);
            });

        const req = httpMock.expectOne({method: "GET", url: "api/references/RIPE/MNT/TEST-MNT?limit=2"});
        expect(req.request.method).toBe("GET");
        req.flush(3);
    });

    it("should encode password when authenticate mntner", () => {
        restService.authenticate(null, "RIPE", "mntner", "SVONJA-MNT", "test+123+456")
            .then((resp) => {
                expect(resp).toBe("TEST");
            });
        // test+123+456 should be encoded to test%252B123%252B456
        const req = httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/SVONJA-MNT?password=test%252B123%252B456&unfiltered=true"});
        expect(req.request.method).toBe("GET");
        req.flush("TEST");
    });
});
