import {ComponentFixture, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {of} from "rxjs";
import {NgSelectModule} from "@ng-select/ng-select";
import {AttributeMetadataService} from "../../../src/app/attribute/attribute-metadata.service";
import {MessageStoreService} from "../../../src/app/updates/message-store.service";
import {MntnerService} from "../../../src/app/updates/mntner.service";
import {RestService} from "../../../src/app/updates/rest.service"
import {PropertiesService} from "../../../src/app/properties.service";
import {PrefixService} from "../../../src/app/domainobject/prefix.service";
import {MaintainersEditorComponent} from "../../../src/app/whois-object/maintainers-editor.component";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {AttributeSharedService} from "../../../src/app/attribute/attribute-shared.service";
import {WebUpdatesCommonsService} from "../../../src/app/updates/web/web-updates-commons.service";

describe("MaintainersEditorComponent", () => {

    let httpMock: HttpTestingController;
    let component: MaintainersEditorComponent;
    let fixture: ComponentFixture<MaintainersEditorComponent>;

    beforeEach(() => {
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
                WebUpdatesCommonsService
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(MaintainersEditorComponent);
        component = fixture.componentInstance;
    });

    it("should remove mnt-by on backspace one by one",  async() => {
        const BACKSPACE_KEYCODE = 8;
        component.ngModel = NG_MODEL;
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

const NG_MODEL = {
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
};

const USER_WITH_MORE_ASSOCIATED_MNT_MOCK = [
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO"], "key": "TE-MNT"},
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO", "PGPKEY-261AA554", "PGPKEY-F91A0E57"], "key": "MAINT-AFILIAS"},
    {"mine": true, "type": "mntner", "auth": ["MD5-PW", "SSO"], "key": "BBC-MNT"},
    {"mine": true, "type": "mntner", "auth": ["SSO"], "key": "TEST-MNT"}
];
