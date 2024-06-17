import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { CoreModule } from '../../../src/app/core/core.module';
import { FeedbackSupportDialogComponent } from '../../../src/app/feedbacksupport/feedback-support-dialog.component';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';
import createSpy = jasmine.createSpy;

describe('FeedbackSupportDialogComponent', () => {
    let component: FeedbackSupportDialogComponent;
    let fixture: ComponentFixture<FeedbackSupportDialogComponent>;
    let propertiesService: PropertiesService;
    let dialogRef = {
        close: createSpy(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule, MatDialogModule],
            declarations: [FeedbackSupportDialogComponent],
            providers: [PropertiesService, UserInfoService, { provide: MatDialogRef, useValue: dialogRef }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        propertiesService = TestBed.inject(PropertiesService);
        fixture = TestBed.createComponent(FeedbackSupportDialogComponent);
        component = fixture.componentInstance;
    });

    const expectAllItems = () => {
        const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
        expect(allItems.length).toBe(2);

        expect(allItems[0].nativeElement.textContent).toContain('Contact our support team');
        expect(allItems[0].nativeElement.textContent).toContain('Need help? Open a ticket.');

        expect(allItems[1].nativeElement.textContent).toContain('Chat');
        expect(allItems[1].nativeElement.textContent).toContain('Launch Chat.');
    };

    const expectAllItemsExceptChat = () => {
        const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
        expect(allItems.length).toBe(1);

        expect(allItems[0].nativeElement.textContent).toContain('Contact our support team');
        expect(allItems[0].nativeElement.textContent).toContain('Need help? Open a ticket.');
    };

    describe('hide chat', () => {
        it('should hide for test, training and rc env', () => {
            propertiesService.LIVE_CHAT_KEY = '';
            fixture.detectChanges();

            expectAllItemsExceptChat();
        });
        it('should show for prod', () => {
            propertiesService.LIVE_CHAT_KEY = 'my secret key';
            fixture.detectChanges();

            expectAllItems();
        });
    });

    it('should handle callbacks', () => {
        propertiesService.LIVE_CHAT_KEY = 'my secret key';
        fixture.detectChanges();

        const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
        expect(allItems).toHaveSize(2);

        const windowMock = spyOn(window, 'open');
        allItems[0].triggerEventHandler('click', null);
        expect(windowMock).toHaveBeenCalled();
        expect(dialogRef.close).toHaveBeenCalledTimes(1);

        const livechat = document.createElement('live-chat');
        const dispatchMock = spyOn(livechat, 'dispatchEvent');
        document.body.appendChild(livechat);
        allItems[1].triggerEventHandler('click', null);
        expect(dispatchMock).toHaveBeenCalledWith(new Event('live-chat-open'));
        expect(dialogRef.close).toHaveBeenCalledTimes(2);
    });
});
