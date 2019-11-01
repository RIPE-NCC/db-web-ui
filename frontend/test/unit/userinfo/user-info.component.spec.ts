import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {of, throwError} from "rxjs";
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";
import {UserInfoComponent} from "../../../src/app/userinfo/user-info.component";
import {PropertiesService} from "../../../src/app/properties.service";
import {IUserInfoResponseData} from "../../../src/app/dropdown/org-data-type.model";

declare const RIPE: any;

//FIXME find way to inject RIPE
xdescribe("UserInfoComponent", () => {
    let component: UserInfoComponent;
    let fixture: ComponentFixture<UserInfoComponent>;
    let userInfoService: any;

    beforeEach(async(() => {
        userInfoService = jasmine.createSpyObj("UserInfoService", ["getUserOrgsAndRoles"]);
        TestBed.configureTestingModule({
            declarations: [
                UserInfoComponent
            ],
            providers: [
                { provide: "RIPE", useValue: {RIPE: RIPE}},
                { provide: UserInfoService, useValue: userInfoService},
                PropertiesService
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserInfoComponent);
        component = fixture.componentInstance;
    });

    it("shouldn't populate upper-right upon authentication error", () => {
        userInfoService.getUserOrgsAndRoles.and.returnValue(throwError(401).toPromise());
        fixture.detectChanges();
        //@ts-ignore
        expect(RIPE.username).toBeUndefined();
    });

    it("should successfully populat upper right corner", () => {
        const mockRespons: IUserInfoResponseData = {
            user: {
                username: "test@ripe.net",
                displayName: "Test User",
                uuid: "aaaa-bbbb-cccc-dddd",
                active: true
            },
            organisations: undefined,
            members: undefined
        };
        userInfoService.getUserOrgsAndRoles.and.returnValue(of(mockRespons).toPromise());
        fixture.detectChanges();
        //@ts-ignore
        expect(RIPE.username).toEqual("Test User");
    });
});
