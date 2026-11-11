import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { QueryFlagsComponent } from 'src/app/query/query-flags.component';
import { IQueryFlag, QueryFlagsService } from 'src/app/query/query-flags.service';
import type { MockedObject } from 'vitest';

describe('QueryFlagsComponent', () => {
    let component: QueryFlagsComponent;
    let fixture: ComponentFixture<QueryFlagsComponent>;
    let queryFlagsServiceSpy: MockedObject<QueryFlagsService>;

    beforeEach(() => {
        queryFlagsServiceSpy = {
            getFlagsFromTerm: vi.fn().mockName('QueryFlagsService.getFlagsFromTerm'),
            getFlags: vi.fn().mockName('QueryFlagsService.getFlags'),
            addSpaceBehindFlagT: vi.fn().mockName('QueryFlagsService.addSpaceBehindFlagT'),
        } as any;
        TestBed.configureTestingModule({
            imports: [FormsModule, QueryFlagsComponent],
            providers: [
                { provide: QueryFlagsService, useValue: queryFlagsServiceSpy },
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
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
        queryFlagsServiceSpy.addSpaceBehindFlagT.mockReturnValue(component.inputTerm);
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
        queryFlagsServiceSpy.getFlags.mockReturnValue(response);
        component.inputTerm = '-i -ne -da';
        queryFlagsServiceSpy.getFlagsFromTerm.mockReturnValue(['-i', '-ne', '-da']);
        component.ngOnChanges();
        fixture.detectChanges();
        expect(component.flags).toEqual(['-i', '-ne', '-da']);
        expect(component.queryFlags.length).toEqual(1);
        expect(queryFlagsServiceSpy.getFlags).toHaveBeenCalledTimes(1);
    });
});
