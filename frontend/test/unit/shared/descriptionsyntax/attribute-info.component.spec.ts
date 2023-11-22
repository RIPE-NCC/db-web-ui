import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreModule } from '../../../../src/app/core/core.module';
import { AttributeInfoComponent } from '../../../../src/app/shared/descriptionsyntax/attr-info.component';
import { SharedModule } from '../../../../src/app/shared/shared.module';

describe('AttributeInfoComponent', () => {
    let component: AttributeInfoComponent;
    let fixture: ComponentFixture<AttributeInfoComponent>;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, SharedModule, CoreModule],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(AttributeInfoComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should provide correct description for mnt-by in object inetnum', () => {
        component.objectType = 'inetnum';
        component.description = 'mnt-by';
        fixture.detectChanges();
        expect(component.text).toEqual(
            `Specifies the identifier of a registered <strong>mntner</strong> object used for authorisation of operations performed with the object that contains this attribute.`,
        );
    });

    it('should provide correct syntax for mnt-by in object inetnum', () => {
        component.objectType = 'inetnum';
        component.syntax = 'mnt-by';
        fixture.detectChanges();
        expect(component.text).toEqual(
            'Made up of letters, digits, the underscore "_" and minus "-" characters; the first' +
                ' character of a name must be a letter, and the last character of a name must be a letter or a digit.  The' +
                ' following words are reserved by RPSL, and they can not be used as names:<br>' +
                '&emsp;"any as-any rs-any peeras and or not atomic from to at action accept announce except refine' +
                ' networks into inbound outbound."<br>' +
                'Names starting with certain prefixes are reserved for certain object types. Names starting with' +
                ' "as-" are reserved for as set names. Names starting with "rs-" are reserved for route set names. Names' +
                ' starting with "rtrs-" are reserved for router set names. Names starting with "fltr-" are reserved for' +
                ' filter set names. Names starting with "prng-" are reserved for peering set names. Names starting with' +
                ' "irt-" are reserved for irt names.',
        );
    });

    it('should provide correct description for decr in object autnum', () => {
        component.objectType = 'autnum';
        component.description = 'remarks';
        fixture.detectChanges();
        expect(component.text).toEqual('Contains remarks.');
    });

    it('should provide correct syntax for mnt-by in object autnum', () => {
        component.objectType = 'autnum';
        component.syntax = 'remarks';
        fixture.detectChanges();
        expect(component.text).toEqual(`A sequence of ASCII characters.`);
    });
});
