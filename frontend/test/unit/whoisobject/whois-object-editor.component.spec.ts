import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Location} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {WhoisObjectEditorComponent} from "../../../src/app/whois-object/whois-object-editor.component";
import {AttributeMetadataService} from "../../../src/app/attribute/attribute-metadata.service";
import {MessageStoreService} from "../../../src/app/updatesweb/message-store.service";
import {AttributeModule} from "../../../src/app/attribute/attribute.module";
import {MntnerService} from "../../../src/app/updatesweb/mntner.service";
import {RestService} from "../../../src/app/updatesweb/rest.service";
import {CharsetToolsService} from "../../../src/app/updatesweb/charset-tools.service";
import {EnumService} from "../../../src/app/updatesweb/enum.service";
import {PropertiesService} from "../../../src/app/properties.service";
import {PrefixService} from "../../../src/app/domainobject/prefix.service";

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
        component.model = modifyinetnum();
        fixture.detectChanges();
        component.btnSubmitClicked();
        fixture.detectChanges();
        expect(component.attributes.length).toEqual(5);
    });

    it("should filter out empty attributes on submit", () => {
        component.model = modifyinetnum();
        fixture.detectChanges();
        component.attributes.push({name: "descr", value: "keep this one"});
        component.attributes.push({name: "descr", value: ""}); // gets removed
        component.attributes.push({name: "descr", value: null}); // gets removed
        component.attributes.push({name: "descr"}); // gets removed

        component.btnSubmitClicked();
        fixture.detectChanges();

        expect(component.model.attributes.attribute.length).toEqual(6);
        expect(component.missingMandatoryAttributes.length).toBe(5);
        expect(component.model.type).toBe("inetnum");
    });

    it("should be able to suss out missing mandatory attributes", () => {
        component.model = modifyinetnum();
        fixture.detectChanges();

        component.btnSubmitClicked();
        fixture.detectChanges();

        expect(component.model.attributes.attribute.length).toEqual(5);
        expect(component.missingMandatoryAttributes.length).toBe(5);
        expect(component.model.type).toBe("inetnum");
    });
});
