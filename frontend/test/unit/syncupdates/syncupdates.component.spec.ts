import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AlertsService } from 'src/app/shared/alert/alerts.service';
import { SyncupdatesComponent } from 'src/app/syncupdates/syncupdates.component';
import { SyncupdatesService } from 'src/app/syncupdates/syncupdates.service';
import type { MockedObject } from 'vitest';

describe('SyncupdatesComponent', () => {
    let component: SyncupdatesComponent;
    let fixture: ComponentFixture<SyncupdatesComponent>;
    let mockSyncupdatesService: MockedObject<SyncupdatesService>;
    let mockAlertsService: MockedObject<AlertsService>;

    beforeEach(() => {
        mockSyncupdatesService = {
            update: vi.fn().mockName('SyncupdatesService.update'),
        } as any;
        mockAlertsService = {
            addGlobalError: vi.fn().mockName('AlertsService.addGlobalError'),
        } as any;

        TestBed.configureTestingModule({
            imports: [SyncupdatesComponent],
            providers: [
                { provide: SyncupdatesService, useValue: mockSyncupdatesService },
                { provide: AlertsService, useValue: mockAlertsService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SyncupdatesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should not call service if rpslObject is empty', () => {
        component.rpslObject = '';
        component.update();
        expect(mockSyncupdatesService.update).not.toHaveBeenCalled();
    });

    it('should call service and set updateResponse on success', () => {
        const response = 'update successful';
        component.rpslObject = 'some object';
        mockSyncupdatesService.update.mockReturnValue(of(response));

        vi.spyOn(document, 'querySelector').mockReturnValue({ scrollIntoView: vi.fn() } as any);

        component.update();

        expect(component.isUpdating).toBe(false);
        expect(component.updateResponse).toEqual(response);
        expect(mockSyncupdatesService.update).toHaveBeenCalledWith('some object');
    });

    it('should handle 504 error', () => {
        const error = new HttpErrorResponse({ status: 504 });
        component.rpslObject = 'some object';
        mockSyncupdatesService.update.mockReturnValue(throwError(() => error));

        component.update();

        expect(component.isUpdating).toBe(false);
        expect(mockAlertsService.addGlobalError).toHaveBeenCalledWith('Timeout performing Syncupdates request');
    });

    it('should handle 500 error', () => {
        const error = new HttpErrorResponse({ status: 500 });
        component.rpslObject = 'some object';
        mockSyncupdatesService.update.mockReturnValue(throwError(() => error));

        component.update();

        expect(component.isUpdating).toBe(false);
        expect(mockAlertsService.addGlobalError).toHaveBeenCalledWith('Internal Server Error performing Syncupdates request');
    });

    it('should handle unknown error', () => {
        const error = new HttpErrorResponse({ status: 400 });
        component.rpslObject = 'some object';
        mockSyncupdatesService.update.mockReturnValue(throwError(() => error));

        component.update();

        expect(component.isUpdating).toBe(false);
        expect(mockAlertsService.addGlobalError).toHaveBeenCalledWith('There was an error performing Syncupdates request');
    });
});
