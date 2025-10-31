import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { QueryParametersService } from 'src/app/query/query-parameters.service';
import { TypesPanelComponent } from 'src/app/query/types-panel.component';
import { LabelPipe } from 'src/app/shared/label.pipe';

describe('TypesPanelComponent', () => {
    let component: TypesPanelComponent;
    let fixture: ComponentFixture<TypesPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, MatCheckboxModule, LabelPipe],
            providers: [
                {
                    provide: QueryParametersService,
                    useValue: {
                        inverseAsList: [],
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TypesPanelComponent);
        component = fixture.componentInstance;

        component.availableTypes = [ObjectTypesEnum.AUT_NUM, ObjectTypesEnum.INETNUM, ObjectTypesEnum.PERSON];

        component.queryParameters = {
            types: {
                AUT_NUM: true,
                INETNUM: false,
                PERSON: true,
                DOMAIN: true,
            },
        } as any;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit numberSelected on ngOnChanges()', () => {
        spyOn(component.numberSelected, 'emit');
        component.ngOnChanges();
        expect(component.numberSelected.emit).toHaveBeenCalledWith(3); // AUT_NUM, PERSON, DOMAIN = 3
    });

    it('should emit correct count from countSelectedCheboxes()', () => {
        spyOn(component.numberSelected, 'emit');
        component.countSelectedCheboxes();
        expect(component.numberSelected.emit).toHaveBeenCalledWith(3);
    });

    it('should return false (enabled) if type is available', () => {
        spyOn(QueryParametersService, 'inverseAsList').and.returnValue([]);
        const disabled = component.isDisabled(ObjectTypesEnum.AUT_NUM);
        expect(disabled).toBeFalse();
    });

    it('should return true (disabled) and uncheck value if type not in availableTypes', () => {
        spyOn(QueryParametersService, 'inverseAsList').and.returnValue([]);

        const spy = spyOn<any>(component, 'uncheckDisabledCheckbox').and.callThrough();
        const disabled = component.isDisabled(ObjectTypesEnum.DOMAIN);

        expect(disabled).toBeTrue();
        expect(spy).toHaveBeenCalledWith(ObjectTypesEnum.DOMAIN);
        expect(component.queryParameters.types.DOMAIN).toBeFalse();
    });

    it('should not disable anything if inverse lookup has values', () => {
        spyOn(QueryParametersService, 'inverseAsList').and.returnValue(['something']);

        const disabled = component.isDisabled(ObjectTypesEnum.DOMAIN);
        expect(disabled).toBeFalse();
    });
});
