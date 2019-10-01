import {TestBed} from "@angular/core/testing";
import {MyResourcesModule} from "../../../app/ng/myresources/my-resources.module";
import {ResourceStatusService} from "../../../app/ng/myresources/resource-status.service";

describe("ResourceStatusService", () => {

    let resourcesDataService: ResourceStatusService;
    
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MyResourcesModule],
            providers: [
                ResourceStatusService
            ],
        });
        resourcesDataService = TestBed.get(ResourceStatusService);
    });

    it("should be created", () => {
        expect(resourcesDataService).toBeTruthy();
    });

    it("should not show status if type is not inet(6)num", () => {
        expect(resourcesDataService.isResourceWithUsage("organisation", "some_status")).toEqual(false);
    });

    it("should show status if type is inetnum and status ALLOCATED PA", () => {
        expect(resourcesDataService.isResourceWithUsage("INETNUM", "ALLOCATED PA")).toEqual(true);
        expect(resourcesDataService.isResourceWithUsage("inetnum", "ALLOCATED PA")).toEqual(true);
    });

    it("should show status if type is inetnum and status SUB-ALLOCATED PA", () => {
        expect(resourcesDataService.isResourceWithUsage("INETNUM", "SUB-ALLOCATED PA")).toEqual(true);
        expect(resourcesDataService.isResourceWithUsage("inetnum", "SUB-ALLOCATED PA")).toEqual(true);
    });

    it("should show status if type is inetnum and status LIR-PARTITIONED PA", () => {
        expect(resourcesDataService.isResourceWithUsage("INETNUM", "LIR-PARTITIONED PA")).toEqual(true);
        expect(resourcesDataService.isResourceWithUsage("inetnum", "LIR-PARTITIONED PA")).toEqual(true);
    });

    it("should show status if type is inet6num and status ALLOCATED-BY-RIR", () => {
        expect(resourcesDataService.isResourceWithUsage("INET6NUM", "ALLOCATED-BY-RIR")).toEqual(true);
        expect(resourcesDataService.isResourceWithUsage("inet6num", "ALLOCATED-BY-RIR")).toEqual(true);
    });

    it("should show status if type is inet6num and status ALLOCATED-BY-LIR", () => {
        expect(resourcesDataService.isResourceWithUsage("INET6NUM", "ALLOCATED-BY-LIR")).toEqual(true);
        expect(resourcesDataService.isResourceWithUsage("inet6num", "ALLOCATED-BY-LIR")).toEqual(true);
    });

    it("should not show status if type is inet6num and status is not ALLOCATED-BY-RIR nor ALLOCATED-BY-LIR", () => {
        expect(resourcesDataService.isResourceWithUsage("INET6NUM", "ASSIGNED ANYCAST")).toEqual(false);
        expect(resourcesDataService.isResourceWithUsage("inet6num", "ASSIGNED ANYCAST")).toEqual(false);
    });

    it("should not show status if type is inetnum and status is not ALLOCATED PA, SUB-ALLOCATED PA nor LIR-PARTITIONED PA", () => {
        expect(resourcesDataService.isResourceWithUsage("INETNUM", "ASSIGNED ANYCAST")).toEqual(false);
        expect(resourcesDataService.isResourceWithUsage("inetnum", "ASSIGNED ANYCAST")).toEqual(false);
    });
});
