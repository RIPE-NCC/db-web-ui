import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {WebAppVersionComponent} from "../../../src/app/version/web-app-version.component";

describe("VersionComponent", () => {
  let component: WebAppVersionComponent;
  let fixture: ComponentFixture<WebAppVersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebAppVersionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebAppVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
