import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { CoreModule } from '../../../src/app/core/core.module';
import { QueryFlagsComponent } from '../../../src/app/query/query-flags.component';
import { IQueryFlag, QueryFlagsService } from '../../../src/app/query/query-flags.service';
import { SharedModule } from '../../../src/app/shared/shared.module';

describe('QueryFlagsComponent', () => {
    let component: QueryFlagsComponent;
    let fixture: ComponentFixture<QueryFlagsComponent>;
    let queryFlagsServiceSpy: jasmine.SpyObj<QueryFlagsService>;

    beforeEach(() => {
        queryFlagsServiceSpy = jasmine.createSpyObj('QueryService', ['getFlags']);
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule, HttpClientTestingModule],
            declarations: [QueryFlagsComponent],
            providers: [{ provide: QueryFlagsService, useValue: queryFlagsServiceSpy }],
        });

        fixture = TestBed.createComponent(QueryFlagsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("shouldn't call service if there is no flags in query terms which user entered", () => {
        component.inputTerm = '';
        component.ngOnChanges();
        fixture.detectChanges();
        expect(queryFlagsServiceSpy.getFlags).toHaveBeenCalledTimes(0);
        expect(component.queryFlags).toEqual([]);
    });

    it('should show just one flag and emit event to hide rest of query form', () => {
        const response: IQueryFlag[] = [
            {
                longFlag: '--inverse',
                shortFlag: '-i',
                description: 'Perform an inverse query.',
            },
        ];
        queryFlagsServiceSpy.getFlags.and.returnValue(of(response));
        spyOn(component.hasValidQueryFlags, 'emit');
        component.inputTerm = '-i -ne -da';
        component.ngOnChanges();
        fixture.detectChanges();
        expect(component.flags).toEqual(['-i', '-ne', '-da']);
        expect(component.queryFlags.length).toEqual(1);
        expect(queryFlagsServiceSpy.getFlags).toHaveBeenCalledTimes(1);
        expect(component.hasValidQueryFlags.emit).toHaveBeenCalledWith(true);
    });

    it('should find all fags from user entered value (valid and invalid flags)', () => {
        component.inputTerm = '-i mnt-by -q -r';
        fixture.detectChanges();
        expect(component.getFlags()).toEqual(['-i', '-q', '-r']);
    });
});
