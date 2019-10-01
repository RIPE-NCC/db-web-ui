import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Location} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";
import {SharedModule} from "../../../app/ng/shared/shared.module";
import {CoreModule} from "../../../app/ng/core/core.module";
import {WhoisObjectEditorComponent} from "../../../app/ng/whois-object/whois-object-editor.component";
import {AttributeMetadataService} from "../../../app/ng/attribute/attribute-metadata.service";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {AttributeModule} from "../../../app/ng/attribute/attribute.module";
import {MntnerService} from "../../../app/ng/updates/mntner.service";
import {RestService} from "../../../app/ng/updates/rest.service";
import {CharsetToolsService} from "../../../app/ng/updates/charset-tools.service";
import {EnumService} from "../../../app/ng/updates/web/enum.service";
import {PropertiesService} from "../../../app/ng/properties.service";
import {PrefixService} from "../../../app/ng/domainobject/prefix.service";

function modifyinetnum() {
    return {
        source: {
            id: "RIPE"
        },
        type: "inetnum",
        attributes: {
            attribute: [
                {name: "inetnum", value: "1.2.3.4"},
                {name: "netname", value: "XYZ Net"},
                {name: "source", value: "RIPE"},
                {name: "created", value: "1970-01-01T00:00:00Z"},
                {name: "last-modified", value: "2014-05-26T13:28:47Z"}
            ]
        },
        link: {type: "locator", href: "https://rest-prepdev.db.ripe.net/ripe/inetnum/185.62.164.0 - 185.62.164.255"},
        "primary-key": {attribute: Array(1)}
    };
}

describe("WhoisObjectEditorComponent", () => {

    let component: WhoisObjectEditorComponent;
    let fixture: ComponentFixture<WhoisObjectEditorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                CoreModule,
                NgSelectModule,
                AttributeModule],
            declarations: [
                WhoisObjectEditorComponent
            ],
            providers: [
                AttributeMetadataService,
                MntnerService,
                MessageStoreService,
                CharsetToolsService,
                {provide: EnumService, useValue: {}},
                {provide: RestService, useValue: {}},
                {provide: Location, useValue: {}},
                {provide: "ModalService", useValue: {}},
                PropertiesService,
                PrefixService
            ]
        });

        fixture = TestBed.createComponent(WhoisObjectEditorComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should be able to submit attributes", () => {
        component.ngModel = modifyinetnum();
        fixture.detectChanges();
        component.btnSubmitClicked();
        fixture.detectChanges();
        expect(component.attributes.length).toEqual(5);
    });

    it("should filter out empty attributes on submit", () => {
        component.ngModel = modifyinetnum();
        fixture.detectChanges();
        component.attributes.push({name: "descr", value: "keep this one"});
        component.attributes.push({name: "descr", value: ""}); // gets removed
        component.attributes.push({name: "descr", value: null}); // gets removed
        component.attributes.push({name: "descr"}); // gets removed

        component.btnSubmitClicked();
        fixture.detectChanges();

        expect(component.ngModel.attributes.attribute.length).toEqual(6);
        expect(component.missingMandatoryAttributes.length).toBe(5);
        expect(component.ngModel.type).toBe("inetnum");
    });

    it("should be able to suss out missing mandatory attributes", () => {
        component.ngModel = modifyinetnum();
        fixture.detectChanges();

        component.btnSubmitClicked();
        fixture.detectChanges();

        expect(component.ngModel.attributes.attribute.length).toEqual(5);
        expect(component.missingMandatoryAttributes.length).toBe(5);
        expect(component.ngModel.type).toBe("inetnum");
    });
});
