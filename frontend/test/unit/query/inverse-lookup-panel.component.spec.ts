import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PropertiesService } from 'src/app/properties.service';
import { InverseAttrsEnum } from 'src/app/query/inverse-attrs.enum';
import { InverseLookupPanelComponent } from 'src/app/query/inverse-lookup-panel.component';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { IQueryParameters } from 'src/app/query/query-parameters.service';
import { LabelPipe } from 'src/app/shared/label.pipe';
import { TypeOfSearchTermEnum } from '../../../src/app/query/type-of-search-term.enum';

describe('InverseLookupPanelComponent', () => {
    let component: InverseLookupPanelComponent;
    let fixture: ComponentFixture<InverseLookupPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, MatCheckboxModule, InverseLookupPanelComponent, LabelPipe],
        }).compileComponents();

        fixture = TestBed.createComponent(InverseLookupPanelComponent);
        component = fixture.componentInstance;

        spyOn(PropertiesService, 'isMobileView').and.returnValue(false);

        component.queryParameters = {
            inverse: {
                ABUSE_C: true,
                ADMIN_C: false,
                AUTH: true,
            },
        } as unknown as IQueryParameters;

        component.availableTypes = [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE];
        component.typeOfSearchedTerm = [];

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize mapInverseLookupAttributesWithTypes on ngOnInit', () => {
        component.ngOnInit();
        expect(component.mapInverseLookupAttributesWithTypes instanceof Map).toBeTrue();
        expect(component.mapInverseLookupAttributesWithTypes.has(InverseAttrsEnum.ABUSE_C)).toBeTrue();
    });

    it('should emit number of selected checkboxes', () => {
        const spy = spyOn(component.numberSelected, 'emit');
        component.queryParameters.inverse = {
            ABUSE_C: true,
            ADMIN_C: false,
            AUTH: true,
        };
        component.countSelectedCheboxes();
        expect(spy).toHaveBeenCalledWith(2);
    });

    it('should call countSelectedCheboxes() on ngOnChanges', () => {
        const spy = spyOn(component, 'countSelectedCheboxes');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalled();
    });

    describe('isDisabled()', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should disable attribute if typeOfSearchedTerm does not match allowed types', () => {
            component.typeOfSearchedTerm = [TypeOfSearchTermEnum.NSERVER];
            const result = component.isDisabled(InverseAttrsEnum.ABUSE_C);
            expect(result).toBeTrue();
        });

        it('should not disable if typeOfSearchedTerm matches allowed types', () => {
            component.typeOfSearchedTerm = [TypeOfSearchTermEnum.EMAIL];
            const result = component.isDisabled(InverseAttrsEnum.ABUSE_MAILBOX);
            expect(result).toBeFalse();
        });

        it('should disable when availableTypes do not include allowed types and typeOfSearchedTerm empty', () => {
            component.typeOfSearchedTerm = [];
            component.availableTypes = [ObjectTypesEnum.AUT_NUM];
            const result = component.isDisabled(InverseAttrsEnum.ABUSE_C);
            expect(result).toBeTrue();
        });

        it('should not disable when all object types available', () => {
            component.typeOfSearchedTerm = [];
            component.availableTypes = Object.values(ObjectTypesEnum);
            const result = component.isDisabled(InverseAttrsEnum.ABUSE_C);
            expect(result).toBeFalse();
        });
    });
});
