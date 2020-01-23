import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {WhoisVersionComponent} from "../../../src/app/version/whois-version.component";
import {IVersion} from "../../../src/app/shared/whois-response-type.model";

describe("WhoisVersionComponent", () => {
  let component: WhoisVersionComponent;
  let fixture: ComponentFixture<WhoisVersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhoisVersionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhoisVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
