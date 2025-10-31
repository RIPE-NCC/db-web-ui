import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { PropertiesService } from 'src/app/properties.service';
import { AdvanceFilterPanelComponent } from 'src/app/query/advance-filter-panel.component';
import { IQueryParameters } from 'src/app/query/query-parameters.service';
import { LabelPipe } from 'src/app/shared/label.pipe';

describe('AdvanceFilterPanelComponent', () => {
    let component: AdvanceFilterPanelComponent;
    let fixture: ComponentFixture<AdvanceFilterPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, MatCheckboxModule, MatRadioModule, AdvanceFilterPanelComponent, LabelPipe],
        }).compileComponents();

        fixture = TestBed.createComponent(AdvanceFilterPanelComponent);
        component = fixture.componentInstance;

        spyOn(PropertiesService, 'isMobileView').and.returnValue(false);

        component.queryParameters = {
            showFullObjectDetails: false,
            doNotRetrieveRelatedObjects: true,
            source: 'RIPE',
        } as unknown as IQueryParameters;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call countSelectedDropdownAdvanceFilter on ngOnChanges', () => {
        const spy = spyOn(component, 'countSelectedDropdownAdvanceFilter');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit correct numberSelected and queryParametersChange (base case)', () => {
        const emitSpy = spyOn(component.numberSelected, 'emit');
        const changeSpy = spyOn(component.queryParametersChange, 'emit');

        component.countSelectedDropdownAdvanceFilter();

        expect(emitSpy).toHaveBeenCalledWith(0);
        expect(changeSpy).toHaveBeenCalledWith(jasmine.objectContaining(component.queryParameters));
    });

    it('should count correctly when all filters are selected', () => {
        const emitSpy = spyOn(component.numberSelected, 'emit');

        component.queryParameters = {
            showFullObjectDetails: true,
            doNotRetrieveRelatedObjects: false,
            source: 'GRS',
        } as unknown as IQueryParameters;

        component.countSelectedDropdownAdvanceFilter();

        expect(emitSpy).toHaveBeenCalledWith(3);
    });

    it('should count correctly for partial selections', () => {
        const emitSpy = spyOn(component.numberSelected, 'emit');

        component.queryParameters = {
            showFullObjectDetails: true,
            doNotRetrieveRelatedObjects: true,
            source: 'GRS',
        } as unknown as IQueryParameters;

        component.countSelectedDropdownAdvanceFilter();

        expect(emitSpy).toHaveBeenCalledWith(2);
    });
});
