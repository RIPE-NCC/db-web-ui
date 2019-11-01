import {ComponentFixture, TestBed} from "@angular/core/testing";
import {SimpleChange} from "@angular/core";
import {By} from "@angular/platform-browser";
import {FullTextResultSummaryComponent} from "../../../src/app/fulltextsearch/full-text-result-summary.component";

describe("FullTextResultSummaryComponent", () => {

    let component: FullTextResultSummaryComponent;
    let fixture: ComponentFixture<FullTextResultSummaryComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                FullTextResultSummaryComponent
            ]
        })
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FullTextResultSummaryComponent);
        component = fixture.componentInstance;
        component.tabledata = [
            {
                name: "Fred",
                value: 99
            },
            {
                name: "Wilma",
                value: 7
            },
            {
                name: "Barney",
                value: 2
            }
        ];
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
    
    it("should show a lovely table", () => {
        expect(component.total).toBeUndefined();
        component.ngOnChanges({
            tabledata: new SimpleChange(null, component.tabledata, true)
        });
        fixture.detectChanges();
        expect(component.total).toBe(108);
    });

    it("should show 3 rows in table", () => {
        component.ngOnChanges({
            tabledata: new SimpleChange(null, component.tabledata, true)
        });
        fixture.detectChanges();
        expect(component.total).toBe(108);
        expect(fixture.debugElement.queryAll(By.css("tbody tr")).length).toBe(3);
        let row1st = fixture.debugElement.queryAll(By.css("tbody tr:first-child td"));
        expect(row1st[0].nativeElement.textContent).toEqual("Fred");
        expect(row1st[1].nativeElement.textContent).toEqual("99");
        let row2nd = fixture.debugElement.queryAll(By.css("tbody tr:nth-child(2) td"));
        expect(row2nd[0].nativeElement.textContent).toEqual("Wilma");
        expect(row2nd[1].nativeElement.textContent).toEqual("7");
        let row3th = fixture.debugElement.queryAll(By.css("tbody tr:nth-child(3) td"));
        expect(row3th[0].nativeElement.textContent).toEqual("Barney");
        expect(row3th[1].nativeElement.textContent).toEqual("2");
    });
});
