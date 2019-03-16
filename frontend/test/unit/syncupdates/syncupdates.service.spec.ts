import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule} from "../../../app/ng2/app.module";
import { SyncupdatesService} from "../../../app/ng2/syncupdates/syncupdates.service";

describe("dbWebApp: SyncupdatesService", () => {

    let httpMock: HttpTestingController;
    let service: SyncupdatesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppModule, HttpClientTestingModule],
            providers: [SyncupdatesService],
        });
        httpMock = TestBed.get(HttpTestingController);
        service = TestBed.get(SyncupdatesService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should trim and encode rpslObject content", () => {

        const rpslObject = " some@data ";
        service.update(rpslObject).subscribe((resp) => {
            expect(resp).toBe("{\"data\":\"some%40data\"}");
        });
        const req = httpMock.expectOne({method: "POST", url: "api/syncupdates"});
        expect(req.request.method).toBe("POST");
        req.flush({data: "some%40data"});
    });

});
