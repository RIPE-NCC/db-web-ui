import {ComponentFixture, TestBed} from "@angular/core/testing";
import {PropertiesService} from "../../../src/app/properties.service";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {FeedbackSupportDialogComponent} from "../../../src/app/feedbacksupport/feedback-support-dialog.component";
import {By} from "@angular/platform-browser";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";

describe("FeedbackSupportDialogComponent", () => {

  let component: FeedbackSupportDialogComponent;
  let fixture: ComponentFixture<FeedbackSupportDialogComponent>;
  let propertiesService: PropertiesService;

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
        { provide: MatDialogRef, useValue: {}}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    propertiesService = TestBed.inject(PropertiesService);
    fixture = TestBed.createComponent(FeedbackSupportDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create the 3 items', () => {
    const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(allItems.length).toBe(3);

    expect(allItems[0].nativeElement.textContent).toContain('Support');
    expect(allItems[0].nativeElement.textContent).toContain('Need help? Open a ticket.');

    expect(allItems[1].nativeElement.textContent).toContain('Report a bug');
    expect(allItems[1].nativeElement.textContent).toContain('Something broken? Let us know!');

    expect(allItems[2].nativeElement.textContent).toContain('Chat');
    expect(allItems[2].nativeElement.textContent).toContain('Launch Chat.');
  });

  it('should handle callbacks', () => {
    const allItems = fixture.debugElement.queryAll(By.css('mat-list-item'));

    const windowMock = spyOn(window, 'open');
    allItems[0].triggerEventHandler('click', null)
    expect(windowMock).toHaveBeenCalled();

    // @ts-ignore
    window.useUsersnap = () => {
      // do nothing
    };
    const useUsersnapMock = spyOn(window, 'useUsersnap' as never);
    allItems[1].triggerEventHandler('click', null)
    expect(useUsersnapMock).toHaveBeenCalled();

    // @ts-ignore
    window.loadZendeskChat = (key) => {
      // do nothing
    };
    const loadZendeskChatMock = spyOn(window, 'loadZendeskChat' as never);
    allItems[2].triggerEventHandler('click', null)
    // @ts-ignore
    expect(loadZendeskChatMock).toHaveBeenCalledWith(propertiesService.LIVE_CHAT_KEY);
  });
});
