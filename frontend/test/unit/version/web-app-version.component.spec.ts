import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {WebAppVersionComponent} from "../../../src/app/version/web-app-version.component";
import {PropertiesService} from "../../../src/app/properties.service";

describe("WebAppVersionComponent", () => {
    let component: WebAppVersionComponent;
    let fixture: ComponentFixture<WebAppVersionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WebAppVersionComponent],
            providers: [{provide: PropertiesService, useValue: {DB_WEB_UI_BUILD_TIME: "2020-01-22T18:22:13Z"}}]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WebAppVersionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
