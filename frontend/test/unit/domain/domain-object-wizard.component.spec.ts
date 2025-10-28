import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { JsUtilService } from '../../../src/app/core/js-utils.service';
import { DomainObjectWizardComponent } from '../../../src/app/domainobject/domain-object-wizard.component';
import { PropertiesService } from '../../../src/app/properties.service';

describe('DomainObjectWizardComponent', () => {
    let component: DomainObjectWizardComponent;
    let fixture: ComponentFixture<DomainObjectWizardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                JsUtilService,
                { provide: Location, useValue: {} },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: { objectType: 'domain', get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param] },
                            queryParamMap: {
                                objectType: 'domain',
                                get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                            },
                        },
                    },
                },
                { provide: Router, useValue: { navigate: () => {} } },
                PropertiesService,
            ],
        });

        fixture = TestBed.createComponent(DomainObjectWizardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create the right attributes', () => {
        component.ngOnInit();
        expect(component.attributes.length).toEqual(9);
        const attrName = ['prefix', 'nserver', 'nserver', 'reverse-zone', 'admin-c', 'tech-c', 'zone-c', 'mnt-by', 'source'];
        for (let attr in component.attributes) {
            expect(component.attributes[attr].name).toEqual(attrName[attr]);
        }
    });
});
