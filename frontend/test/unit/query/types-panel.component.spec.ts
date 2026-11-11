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
        vi.spyOn(component.numberSelected, 'emit').mockReturnValue(undefined);
        component.ngOnChanges();
        expect(component.numberSelected.emit).toHaveBeenCalledWith(3); // AUT_NUM, PERSON, DOMAIN = 3
    });

    it('should emit correct count from countSelectedCheboxes()', () => {
        vi.spyOn(component.numberSelected, 'emit').mockReturnValue(undefined);
        component.countSelectedCheboxes();
        expect(component.numberSelected.emit).toHaveBeenCalledWith(3);
    });

    it('should return false (enabled) if type is available', () => {
        vi.spyOn(QueryParametersService, 'inverseAsList').mockReturnValue([]);
        const disabled = component.isDisabled(ObjectTypesEnum.AUT_NUM);
        expect(disabled).toBe(false);
    });

    it('should return true (disabled) and uncheck value if type not in availableTypes', () => {
        vi.spyOn(QueryParametersService, 'inverseAsList').mockReturnValue([]);

        const spy = vi.spyOn(component as any, 'uncheckDisabledCheckbox');
        const disabled = component.isDisabled(ObjectTypesEnum.DOMAIN);

        expect(disabled).toBe(true);
        expect(spy).toHaveBeenCalledWith(ObjectTypesEnum.DOMAIN);
        expect(component.queryParameters.types.DOMAIN).toBe(false);
    });

    it('should not disable anything if inverse lookup has values', () => {
        vi.spyOn(QueryParametersService, 'inverseAsList').mockReturnValue(['something']);

        const disabled = component.isDisabled(ObjectTypesEnum.DOMAIN);
        expect(disabled).toBe(false);
    });
});
