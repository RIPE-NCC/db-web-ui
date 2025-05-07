import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreModule } from '../../../src/app/core/core.module';
import { QueryFlagsComponent } from '../../../src/app/query/query-flags.component';
import { IQueryFlag, QueryFlagsService } from '../../../src/app/query/query-flags.service';
import { SharedModule } from '../../../src/app/shared/shared.module';

describe('QueryFlagsComponent', () => {
    let component: QueryFlagsComponent;
    let fixture: ComponentFixture<QueryFlagsComponent>;
    let queryFlagsServiceSpy: jasmine.SpyObj<QueryFlagsService>;

    beforeEach(() => {
        queryFlagsServiceSpy = jasmine.createSpyObj('QueryFlagsService', ['getFlagsFromTerm', 'getFlags', 'addSpaceBehindFlagT']);
        TestBed.configureTestingModule({
            declarations: [QueryFlagsComponent],
            imports: [SharedModule, CoreModule],
            providers: [
                { provide: QueryFlagsService, useValue: queryFlagsServiceSpy },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });

        fixture = TestBed.createComponent(QueryFlagsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("shouldn't call service if there is no flags in query terms which user entered", () => {
        component.inputTerm = '';
        queryFlagsServiceSpy.addSpaceBehindFlagT.and.returnValue(component.inputTerm);
        component.ngOnChanges();
        fixture.detectChanges();
        expect(queryFlagsServiceSpy.getFlagsFromTerm).toHaveBeenCalledTimes(1);
        expect(queryFlagsServiceSpy.getFlags).toHaveBeenCalledTimes(0);
        expect(component.queryFlags).toEqual([]);
    });

    it('should show just one flag', () => {
        const response: IQueryFlag[] = [
            {
                longFlag: '--inverse',
                shortFlag: '-i',
                description: 'Perform an inverse query.',
            },
        ];
        queryFlagsServiceSpy.getFlags.and.returnValue(response);
        component.inputTerm = '-i -ne -da';
        queryFlagsServiceSpy.getFlagsFromTerm.and.returnValue(['-i', '-ne', '-da']);
        component.ngOnChanges();
        fixture.detectChanges();
        expect(component.flags).toEqual(['-i', '-ne', '-da']);
        expect(component.queryFlags.length).toEqual(1);
        expect(queryFlagsServiceSpy.getFlags).toHaveBeenCalledTimes(1);
    });
});
