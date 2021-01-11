import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";
import {PrefixService} from "../../../src/app/domainobject/prefix.service";

describe("PrefixService", () => {

    let prefixService: PrefixService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PrefixService
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        prefixService = TestBed.inject(PrefixService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(prefixService).toBeTruthy();
    });

    describe("IPv4", () => {
        it("should be able to validate a bunch of good prefixes", () => {
            expect(prefixService.isValidPrefix("22.22.0.0/16")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/17")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/18")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/19")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/20")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/21")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/22")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/23")).toBe(true);
            expect(prefixService.isValidPrefix("22.22.0.0/24")).toBe(true);
        });

        it("should fail on out-of-range subnet mask", () => {
            expect(prefixService.isValidPrefix("22.22.0.0/8")).toBe(false);
            expect(prefixService.isValidPrefix("22.22.0.0/25")).toBe(false);
        });

        it("should fail when address bits are masked", () => {
            expect(prefixService.isValidPrefix("192.168.64.0/17")).toBe(false);
            expect(prefixService.isValidPrefix("192.168.255.0/18")).toBe(false);
            expect(prefixService.isValidPrefix("192.168.0.1/24")).toBe(false);
        });

        it("should fail when address is not complete", () => {
            expect(prefixService.isValidPrefix("192.168.0/17")).toBe(false);
        });

        it("should fail when subnet mask is missing", () => {
            expect(prefixService.isValidPrefix("192.168.0.0")).toBe(false);
            expect(prefixService.isValidPrefix("192.168.0.0/")).toBe(false);
            expect(prefixService.isValidPrefix("192.168.0.0/0")).toBe(false);
            expect(prefixService.isValidPrefix("192.168.0.0/00")).toBe(false);
        });

        it("should generate some lovely reverse zone records", () => {
            //expect(prefixService.getReverseDnsZones("22.0.0.0/9").length).toBe(128);
            //expect(prefixService.getReverseDnsZones("22.0.0.0/10").length).toBe(64);
            //expect(prefixService.getReverseDnsZones("22.0.0.0/11").length).toBe(32);
            //expect(prefixService.getReverseDnsZones("22.0.0.0/12").length).toBe(16);
            //expect(prefixService.getReverseDnsZones("22.0.0.0/13").length).toBe(8);
            //expect(prefixService.getReverseDnsZones("22.0.0.0/14").length).toBe(4);
            //expect(prefixService.getReverseDnsZones("22.0.0.0/15").length).toBe(2);
            expect(prefixService.getReverseDnsZones("22.0.0.0/16").length).toBe(1);
            expect(prefixService.getReverseDnsZones("22.22.0.0/17").length).toBe(128);
            expect(prefixService.getReverseDnsZones("22.22.0.0/18").length).toBe(64);
            expect(prefixService.getReverseDnsZones("22.22.0.0/19").length).toBe(32);
            expect(prefixService.getReverseDnsZones("22.22.0.0/20").length).toBe(16);
            expect(prefixService.getReverseDnsZones("22.22.0.0/21").length).toBe(8);
            expect(prefixService.getReverseDnsZones("22.22.0.0/22").length).toBe(4);
            expect(prefixService.getReverseDnsZones("22.22.0.0/23").length).toBe(2);
            expect(prefixService.getReverseDnsZones("22.22.0.0/24").length).toBe(1);
        });

    });

    describe("IPv6", () => {
        it("should be able to validate a bunch of good prefixes", () => {
            expect(prefixService.isValidPrefix("2001:db8::/48")).toBe(true);
            expect(prefixService.isValidPrefix("2001:db8::/64")).toBe(true);
            // expect(prefixService.isValidPrefix("2001:db8::1/19")).toBe(true);
            // expect(prefixService.isValidPrefix("2001:db8::1/20")).toBe(true);
            // expect(prefixService.isValidPrefix("2001:db8::1/21")).toBe(true);
            // expect(prefixService.isValidPrefix("2001:db8::1/22")).toBe(true);
            // expect(prefixService.isValidPrefix("2001:db8::1/23")).toBe(true);
            // expect(prefixService.isValidPrefix("2001:db8::1/24")).toBe(true);
        });

        it("should fail on out-of-range subnet mask", () => {
            expect(prefixService.isValidPrefix("2001:db8::/0")).toBe(false);
            //expect(prefixService.isValidPrefix("2001:db8::/128")).toBe(false);
        });

        it("should fail when address bits are masked", () => {
            expect(prefixService.isValidPrefix("2001:db8::1/48")).toBe(false);
            expect(prefixService.isValidPrefix("2001:db8::/28")).toBe(false);
        });

        it("should fail when subnet mask is missing", () => {
            expect(prefixService.isValidPrefix("2001:db8::")).toBe(false);
            expect(prefixService.isValidPrefix("2001:db8::/")).toBe(false);
            expect(prefixService.isValidPrefix("2001:db8::/0")).toBe(false);
            expect(prefixService.isValidPrefix("2001:db8::/00")).toBe(false);
        });

        it("should generate some lovely reverse zone records", () => {
            expect(prefixService.getReverseDnsZones("2001:db8::/48").length).toBe(1);
            expect(prefixService.getReverseDnsZones("2001:db8::/47").length).toBe(2);
            expect(prefixService.getReverseDnsZones("2001:db8::/46").length).toBe(4);
            expect(prefixService.getReverseDnsZones("2001:db8::/45").length).toBe(8);
            expect(prefixService.getReverseDnsZones("2001:db8::/44").length).toBe(1);
        });

    });

});
