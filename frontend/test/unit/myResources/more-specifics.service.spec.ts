import {TestBed} from "@angular/core/testing";
import {MyResourcesModule} from "../../../src/app/myresources/my-resources.module";
import {MoreSpecificsService} from "../../../src/app/myresources/more-specifics.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe("MoreSpecificsService", () => {

    let moreSpecificsService: MoreSpecificsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MyResourcesModule],
            providers: [
                MoreSpecificsService
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        moreSpecificsService = TestBed.get(MoreSpecificsService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(moreSpecificsService).toBeTruthy();
    });

    it("should reject invalid initialization", (done) => {

        moreSpecificsService.getSpecifics("", "", undefined, "")
             .subscribe((res: any) => {},
                (error: any) => {
                    expect(error).toEqual("objectType is empty. more-specifics not available");
                    done();
                });

        moreSpecificsService.getSpecifics("OBJECT_NAME", "", undefined, "")
             .subscribe((res: any) => {},
                (error: any) => {
                    expect(error).toEqual("objectType is empty. more-specifics not available");
                    done();
                });

        moreSpecificsService.getSpecifics("", "OBJECT_TYPE", undefined, "")
             .subscribe((res: any) => {},
                (error: any) => {
                    expect(error).toEqual("objectName is empty. more-specifics not available");
                    done();
                });

        moreSpecificsService.getSpecifics("OBJECT_NAME", "OBJECT_TYPE", 0, "")
            .subscribe((res: any) => {
                    expect(res).toEqual({resp: "lol"});
                    done();
                }
            );
        const req1 = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=&page=0"});
        expect(req1.request.method).toBe("GET");
        req1.flush({resp: "lol"});

        moreSpecificsService.getSpecifics("OBJECT_NAME", "OBJECT_TYPE", 0, "FILTER")
            .subscribe((res: any) => {
                expect(res).toEqual({ resp: "lol" });
                done();
            });
        const req2 = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=FILTER&page=0"});
        expect(req2.request.method).toBe("GET");
        req2.flush({ resp: "lol" });

        moreSpecificsService.getSpecifics("OBJECT_NAME", "OBJECT_TYPE", 1, "FILTER")
            .subscribe((res: any) => {
                expect(res).toEqual({ resp: "lol" });
                done();
            });
        const req3 = httpMock.expectOne({method: "GET", url: "api/whois-internal/api/resources/OBJECT_TYPE/OBJECT_NAME/more-specifics.json?filter=FILTER&page=1"});
        expect(req3.request.method).toBe("GET");
        req3.flush({ resp: "lol" });
    });
});
