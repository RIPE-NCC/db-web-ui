import {ComponentFixture, TestBed} from "@angular/core/testing";
import {PropertiesService} from "../../../src/app/properties.service";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {FeedbackSupportDialogComponent} from "../../../src/app/feedbacksupport/feedback-support-dialog.component";
import {By} from "@angular/platform-browser";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import createSpy = jasmine.createSpy;
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";

describe("FeedbackSupportDialogComponent", () => {

  let component: FeedbackSupportDialogComponent;
  let fixture: ComponentFixture<FeedbackSupportDialogComponent>;
  let propertiesService: PropertiesService;
  let dialogRef = {
    close: createSpy(),
  }

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule,
        MatDialogModule
      ],
      declarations: [
        FeedbackSupportDialogComponent
      ],
      providers: [
        PropertiesService,
        UserInfoService,
        { provide: MatDialogRef, useValue: dialogRef}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    propertiesService = TestBed.inject(PropertiesService);
    fixture = TestBed.createComponent(FeedbackSupportDialogComponent);
    component = fixture.componentInstance;
  });

  const expectAllItems = () => {
    const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(allItems.length).toBe(3);

    expect(allItems[0].nativeElement.textContent).toContain('Contact our support team');
    expect(allItems[0].nativeElement.textContent).toContain('Need help? Open a ticket.');

    expect(allItems[1].nativeElement.textContent).toContain('Report a bug');
    expect(allItems[1].nativeElement.textContent).toContain('Something broken? Let us know!');

    expect(allItems[2].nativeElement.textContent).toContain('Chat');
    expect(allItems[2].nativeElement.textContent).toContain('Launch Chat.');
  };

  const expectAllItemsExceptChat = () => {
    const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(allItems.length).toBe(2);

    expect(allItems[0].nativeElement.textContent).toContain('Contact our support team');
    expect(allItems[0].nativeElement.textContent).toContain('Need help? Open a ticket.');

    expect(allItems[1].nativeElement.textContent).toContain('Report a bug');
    expect(allItems[1].nativeElement.textContent).toContain('Something broken? Let us know!');
  };

  describe('hide chat', () => {
    it('should hide for test, training and rc env', () => {
      propertiesService.LIVE_CHAT_KEY = ''
      fixture.detectChanges();

      expectAllItemsExceptChat();
    });
    it('should show for prod', () => {
      propertiesService.LIVE_CHAT_KEY = 'my secret key'
      fixture.detectChanges();

      expectAllItems();
    });
  })

  it('should handle callbacks', () => {
    propertiesService.LIVE_CHAT_KEY = 'my secret key'
    fixture.detectChanges();

    const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(allItems).toHaveSize(3);

    const windowMock = spyOn(window, 'open');
    allItems[0].triggerEventHandler('click', null)
    expect(windowMock).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);

    // @ts-ignore
    window.useUsersnapCX = () => {
      // do nothing
    };
    const useUsersnapMock = spyOn(window, 'useUsersnapCX' as never);
    allItems[1].triggerEventHandler('click', null)
    expect(useUsersnapMock).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledTimes(2);

    const livechat = document.createElement('live-chat')
    const dispatchMock = spyOn(livechat, 'dispatchEvent');
    document.body.appendChild(livechat)
    allItems[2].triggerEventHandler('click', null)
    expect(dispatchMock).toHaveBeenCalledWith(new Event('live-chat-open'));
    expect(dialogRef.close).toHaveBeenCalledTimes(3);
  });
});
