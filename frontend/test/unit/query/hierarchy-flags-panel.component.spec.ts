import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { HierarchyFlagsPanelComponent } from 'src/app/query/hierarchy-flags-panel.component';
import { IQueryParameters } from 'src/app/query/query-parameters.service';
import { LabelPipe } from 'src/app/shared/label.pipe';
import { HierarchyFlagsService } from '../../../src/app/query/hierarchy-flags.service';

describe('HierarchyFlagsPanelComponent', () => {
    let component: HierarchyFlagsPanelComponent;
    let fixture: ComponentFixture<HierarchyFlagsPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, MatCheckboxModule, MatSliderModule, HierarchyFlagsPanelComponent, LabelPipe],
        }).compileComponents();

        fixture = TestBed.createComponent(HierarchyFlagsPanelComponent);
        component = fixture.componentInstance;

        component.queryParameters = {
            hierarchy: 'No',
            reverseDomain: false,
        } as IQueryParameters;

        spyOn(HierarchyFlagsService, 'idHierarchyFlagFromShort').and.callFake((shortVal: string) => {
            const map = { No: 0, l: 1, L: 2, m: 3, M: 4, x: 5 };
            return map[shortVal] ?? 0;
        });

        (HierarchyFlagsService as any).hierarchyFlagMap = [
            { id: 0, short: 'No', long: '', description: 'No hierarchy flag (default).' },
            {
                id: 1,
                short: 'l',
                long: 'one-less',
                description: 'Returns first level less specific inetnum, inet6num or route(6) objects, excluding exact matches.',
            },
            {
                id: 2,
                short: 'L',
                long: 'all-less',
                description: 'Returns all level less specific inetnum, inet6num or route(6) objects, including exact matches.',
            },
            {
                id: 3,
                short: 'm',
                long: 'one-more',
                description: 'Returns first level more specific inetnum, inet6num or route(6) objects, excluding exact matches.',
            },
            {
                id: 4,
                short: 'M',
                long: 'all-more',
                description: 'Returns all level more specific inetnum, inet6num or route(6) objects, excluding exact matches.',
            },
            {
                id: 5,
                short: 'x',
                long: 'exact',
                description: 'Requests that only an exact match on a prefix be performed. If no exact match is found no objects are returned.',
            },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set hierarchyFlag from queryParameters on ngOnInit', () => {
        component.queryParameters.hierarchy = 'l';
        component.ngOnInit();
        expect(component.hierarchyFlag).toBe(1);
    });

    it('should update hierarchyFlag and emit count on ngOnChanges', () => {
        const numberSpy = spyOn(component.numberSelected, 'emit');
        spyOn(component.queryParametersChange, 'emit');

        component.queryParameters.hierarchy = 'L';
        component.queryParameters.reverseDomain = true;

        component.ngOnChanges();

        expect(component.hierarchyFlag).toBe(2);
        expect(numberSpy).toHaveBeenCalledWith(2);
        expect(component.queryParametersChange.emit).toHaveBeenCalled();
    });

    it('should update queryParameters and emit when setHierarchyFlag() is called', () => {
        spyOn(component, 'countSelectedHierarchyFlags');
        component.setHierarchyFlag(2);
        expect(component.queryParameters.hierarchy).toBe('L');
        expect(component.countSelectedHierarchyFlags).toHaveBeenCalled();
    });

    it('should return correct description for setHierarchyFlagDescription()', () => {
        const desc = component.setHierarchyFlagDescription(1);
        expect(desc).toBe('Returns first level less specific inetnum, inet6num or route(6) objects, excluding exact matches.');
    });

    it('should return correct short name for getShortHierarchyFlagName()', () => {
        const short = component.getShortHierarchyFlagName(2);
        expect(short).toBe('L');
    });

    it('should emit correct number of selected hierarchy flags', () => {
        spyOn(component.numberSelected, 'emit');
        spyOn(component.queryParametersChange, 'emit');

        // only reverseDomain = true
        component.queryParameters.reverseDomain = true;
        component.queryParameters.hierarchy = 'No';
        component.countSelectedHierarchyFlags();
        expect(component.numberSelected.emit).toHaveBeenCalledWith(1);

        // hierarchy not empty and not default
        component.queryParameters.reverseDomain = false;
        component.queryParameters.hierarchy = 'L';
        component.countSelectedHierarchyFlags();
        expect(component.numberSelected.emit).toHaveBeenCalledWith(1);

        // both selected
        component.queryParameters.reverseDomain = true;
        component.queryParameters.hierarchy = 'L';
        component.countSelectedHierarchyFlags();
        expect(component.numberSelected.emit).toHaveBeenCalledWith(2);

        // should also emit queryParametersChange each time
        expect(component.queryParametersChange.emit).toHaveBeenCalledTimes(3);
    });
});
