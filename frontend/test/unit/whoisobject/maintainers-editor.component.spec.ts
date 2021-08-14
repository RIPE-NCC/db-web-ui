import {ComponentFixture, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {of} from "rxjs";
import {NgSelectModule} from "@ng-select/ng-select";
import {AttributeMetadataService} from "../../../src/app/attribute/attribute-metadata.service";
import {MessageStoreService} from "../../../src/app/updatesweb/message-store.service";
import {MntnerService} from "../../../src/app/updatesweb/mntner.service";
import {RestService} from "../../../src/app/updatesweb/rest.service"
import {PropertiesService} from "../../../src/app/properties.service";
import {PrefixService} from "../../../src/app/domainobject/prefix.service";
import {MaintainersEditorComponent} from "../../../src/app/whois-object/maintainers-editor.component";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {AttributeSharedService} from "../../../src/app/attribute/attribute-shared.service";
import {WebUpdatesCommonsService} from "../../../src/app/updatesweb/web-updates-commons.service";
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

describe("MaintainersEditorComponent", () => {

    let httpMock: HttpTestingController;
    let component: MaintainersEditorComponent;
    let fixture: ComponentFixture<MaintainersEditorComponent>;
    let modalMock: any;
    let webUpdatesCommonsServiceMock: any;
    const BACKSPACE_KEYCODE = 8;

    beforeEach(() => {
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        webUpdatesCommonsServiceMock = jasmine.createSpyObj("WebUpdatesCommonsService", ["performAuthentication"]);
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                CoreModule,
                NgSelectModule,
                HttpClientTestingModule],
            declarations: [
                MaintainersEditorComponent
            ],
            providers: [
                AttributeSharedService,
                AttributeMetadataService,
                MntnerService,
                MessageStoreService,
                RestService,
                {provide: Router, useValue: {navigate: () => {}}},
                PropertiesService,
                PrefixService,
                WebUpdatesCommonsService,
                UserInfoService,
                {provide: NgbModal, useValue: modalMock}
            ]
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(MaintainersEditorComponent);
        component = fixture.componentInstance;
        component.whoisObject = NG_MODEL();
    });

    it("should ask for password after add non-sso maintainer with password - create case.", async () => {
        modalMock.open.and.returnValue({componentInstance: {}, result: of().toPromise()});
        spyOn(component.restService, "fetchMntnersForSSOAccount")
            .and.returnValue(of(USER_WITH_ONE_SSO_ASSOCIATED_MNT_MOCK));
        spyOn(component, "onMntnerRemoved");
        fixture.detectChanges();
        await fixture.whenStable();
        // simulate manual removal of the last and only mntner
        const mntInput = fixture.debugElement.query(By.css("ng-select"));
        triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
        expect(component.onMntnerRemoved).toHaveBeenCalled();
        expect(component.mntners.object.length === 0).toBeTruthy();

        // simulate manual addition of a new mntner with only md5
        component.mntners.object = [{"mine":false,"type":"mntner","auth":["MD5"],"key":"TEST-MNT-1"}];
        component.onMntnerAdded({"mine":false,"type":"mntner","auth":["MD5"],"key":"TEST-MNT-1"});
        await fixture.whenStable();
        expect(modalMock.open).toHaveBeenCalled();
    });

    it("should add a null when removing the last maintainer.", async () => {
        spyOn(component.restService, "fetchMntnersForSSOAccount")
            .and.returnValue(of(USER_WITH_ONE_SSO_ASSOCIATED_MNT_MOCK));
        fixture.detectChanges();
        expect(component.mntners.object.length).toEqual(1);
        expect(component.mntners.object[0].key).toEqual("TEST-MNT");
        // remove last mntner
        component.onMntnerRemoved(component.mntners.object[0]);
        await fixture.whenStable();
        expect(component.attributes.find(attr => attr.name ==="mnt-by").value).toEqual("");
    });

    it("should add the selected maintainers to the object emit update-mntners-clbk", async () => {
        spyOn(component.updateMntnersClbk, "emit");
        spyOn(component.mntnerService, "needsPasswordAuthentication").and.returnValue(false);
        fixture.detectChanges();
        expect(component.mntners.object.length).toEqual(0);
        component.onMntnerAdded({"mine":false,"type":"mntner","auth":["SSO"],"key":"TEST-MNT-1"});
        await fixture.whenStable();
        expect(component.mntners.object.length).toEqual(1);
        expect(component.updateMntnersClbk.emit).toHaveBeenCalled();
    });

    it("should remove the selected maintainers from the object emit update-mntners-clbk", async () => {
        spyOn(component.updateMntnersClbk, "emit");
        spyOn(component.mntnerService, "needsPasswordAuthentication").and.returnValue(false);
        fixture.detectChanges();
        component.mntners.object = [{"mine":false,"type":"mntner","auth":["SSO"],"key":"TEST-MNT-1"}];
        expect(component.mntners.object.length).toEqual(1);
        component.onMntnerRemoved({"mine":false,"type":"mntner","auth":["SSO"],"key":"TEST-MNT-1"});
        await fixture.whenStable();
        expect(component.mntners.object.length).toEqual(0);
        expect(component.updateMntnersClbk.emit).toHaveBeenCalled();
    });

    it("should remove mnt-by on backspace one by one",  async() => {
        spyOn(component.restService, "fetchMntnersForSSOAccount")
            .and.returnValue(of(USER_WITH_MORE_ASSOCIATED_MNT_MOCK));
        spyOn(component, "onMntnerRemoved").and.callThrough();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.attributes.length).toBe(12);
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css("#selectMaintainerDropdown .ng-value")).length).toBe(4);
        const mntInput = fixture.debugElement.query(By.css("ng-select"));
        triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
        expect(component.onMntnerRemoved).toHaveBeenCalled(); //method which remove mnt-by from attributes
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css("#selectMaintainerDropdown .ng-value")).length).toBe(3);
        expect(component.attributes.length).toBe(11);
        triggerKeyDownEvent(mntInput, BACKSPACE_KEYCODE);
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css("#selectMaintainerDropdown .ng-value")).length).toBe(2);
        expect(component.attributes.length).toBe(10);
    });

    function triggerKeyDownEvent(element: DebugElement, which: number, key = ''): void {
        element.triggerEventHandler('keydown', {
            which: which,
            key: key,
            preventDefault: () => {
            },
        });
    }
});

const NG_MODEL = () => ({
    "attributes": {
        "attribute": [
            {
                "name": "prefix",
                "value": "",
                "$$error": "",
                "$$info": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": false,
                "$$id": "attr-0"
            },
            {
                "name": "nserver",
                "value": "",
                "$$error": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": false,
                "$$id": "attr-1"
            },
            {
                "name": "nserver",
                "value": "",
                "$$error": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": false,
                "$$id": "attr-2"
            },
            {
                "name": "reverse-zone",
                "value": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": false,
                "$$id": "attr-3"
            },
            {
                "name": "admin-c",
                "value": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": false,
                "$$id": "attr-4"
            },
            {
                "name": "tech-c",
                "value": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": false,
                "$$id": "attr-5"
            },
            {
                "name": "zone-c",
                "value": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": false,
                "$$id": "attr-6"
            },
            {
                "name": "mnt-by",
                "value": "",
                "$$invalid": true,
                "$$hidden": false,
                "$$disable": false,
                "$$id": "attr-7"
            },
            {
                "name": "source",
                "value": "",
                "$$invalid": true,
                "$$hidden": true,
                "$$disable": true,
                "$$id": "attr-8"
            }
        ]
    },
    "source": {
        "id": "RIPE"
    }
});

const USER_WITH_MORE_ASSOCIATED_MNT_MOCK = [
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO"], "key": "TE-MNT"},
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO", "PGPKEY-261AA554", "PGPKEY-F91A0E57"], "key": "MAINT-AFILIAS"},
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO"], "key": "BBC-MNT"},
    {"mine": true, "type": "mntner", "auth": ["SSO"], "key": "TEST-MNT"}
];

const USER_WITH_ONE_SSO_ASSOCIATED_MNT_MOCK = [
    {"mine": true, "type": "mntner", "auth": ["SSO"], "key": "TEST-MNT"}
];
