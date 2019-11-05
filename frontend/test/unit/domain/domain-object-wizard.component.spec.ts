import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Location} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";

import {DomainObjectWizardComponent} from "../../../src/app/domainobject/domain-object-wizard.component";
import {JsUtilService} from "../../../src/app/core/js-utils.service";
import {PropertiesService} from "../../../src/app/properties.service";
import {DomainObjectModule} from "../../../src/app/domainobject/domain-object.module";
import {WINDOW} from "../../../src/app/core/window.service";

describe("DomainObjectWizardComponent", () => {

    let component: DomainObjectWizardComponent;
    let fixture: ComponentFixture<DomainObjectWizardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                DomainObjectModule
            ],
            providers: [
                JsUtilService,
                { provide: Location, useValue: {}},
                { provide: ActivatedRoute, useValue: {snapshot: {paramMap: {objectType: "domain", get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param])}}}},
                { provide: Router, useValue: {navigate:() => {}}},
                { provide: WINDOW, useValue: {}},
                PropertiesService
            ]
        });

        fixture = TestBed.createComponent(DomainObjectWizardComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should create the right attributes", () => {
        TestBed.get(ActivatedRoute).snapshot.queryParamMap = {
            objectType: "domain",
            get: (param: string) => (component.activatedRoute.snapshot.queryParamMap[param]),
        };
        component.ngOnInit();
        expect(component.attributes.length).toEqual(9);
        const attrName = [
            "prefix",
            "nserver",
            "nserver",
            "reverse-zone",
            "admin-c",
            "tech-c",
            "zone-c",
            "mnt-by",
            "source"];
        for (let attr in component.attributes) {
            expect(component.attributes[attr].name).toEqual(attrName[attr]);
        }
    });
});
