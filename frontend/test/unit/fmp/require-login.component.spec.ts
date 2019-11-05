import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {RequireLoginComponent} from "../../../src/app/fmp/require-login.component";
import {PropertiesService} from "../../../src/app/properties.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe("RequireLoginComponent", () => {

    let component: RequireLoginComponent;
    let fixture: ComponentFixture<RequireLoginComponent>;
    let mockLocation: any;

    beforeEach(() => {
        mockLocation = jasmine.createSpyObj("Location", ["search", "absUrl"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                RequireLoginComponent
            ],
            providers: [
                PropertiesService,
                { provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: {}}}}
            ],
        })
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RequireLoginComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("Testing login url", () => {
        it("should extract return url", () => {
            TestBed.get(ActivatedRoute).snapshot.queryParamMap = {
                has: (param: string) => (false)
            };
            mockLocation.search.and.returnValue({});
            mockLocation.absUrl.and.returnValue("http://server/#/fmp/requireLogin");
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.href+"#/fmp/");
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it("should not extract return url for forgot maintainer page", () => {
            TestBed.get(ActivatedRoute).snapshot.queryParamMap = {
                has: (param: string) => (false)
            };
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.href+"#/fmp/");
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it("should extract return url for forgot maintainer page", () => {
            TestBed.get(ActivatedRoute).snapshot.queryParamMap = {
                get: (param: string) => ((param === "mntnerKey") ? "mnt-key": true),
                has: (param: string) => (true)
            };
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.href+"#/fmp/change-auth?mntnerKey=mnt-key&voluntary=true");
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it("should extract return url for forgot maintainer page with voluntary undefined", () => {
            TestBed.get(ActivatedRoute).snapshot.queryParamMap = {
                get: (param: string) => ((param === "mntnerKey") ? "mnt-key": false),
                has: (param: string) => (true)
            };
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.href+"#/fmp/change-auth?mntnerKey=mnt-key&voluntary=false");
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });

        it("should extract return url for forgot maintainer page with voluntary false", () => {
            TestBed.get(ActivatedRoute).snapshot.queryParamMap = {
                get: (param: string) => ((param === "mntnerKey") ? "mnt-key": false),
                has: (param: string) => (true)
            };
            fixture.detectChanges();
            const expectedUrl = encodeURIComponent(window.location.href+"#/fmp/change-auth?mntnerKey=mnt-key&voluntary=false");
            expect(component.loginUrl).toBe(`https://access.prepdev.ripe.net/?originalUrl=${expectedUrl}`);
        });
    });
});
