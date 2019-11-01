import {ComponentFixture, TestBed} from "@angular/core/testing";
import {PaginationComponent} from "../../../../src/app/shared/paginator/pagination.component";

describe("PaginationComponent", () => {

    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                PaginationComponent
            ],
        })
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
    });

    it("should not crash", () => {
        fixture.detectChanges();
        expect(component.hidePaginator).toEqual(false);
    });

    it("should show all results on 1 page", () => {
        component.numResults = 5;
        component.resultsPerPage = 100;

        fixture.detectChanges();
        expect(component.hidePaginator).toEqual(true);
        expect(component.activePage).toEqual(1);
    });

    it("should figure out how many pages to show and go there", () => {
        component.numResults = 400;
        component.resultsPerPage = 10;

        fixture.detectChanges();

        expect(component.hidePaginator).toEqual(false);
        expect(component.activePage).toEqual(1);

        component.fastFwd(2);
        expect(component.activePage).toEqual(3);

        component.pageSelected(0);
        expect(component.activePage).toEqual(1);

        component.fastFwd(-2);
        expect(component.activePage).toEqual(1);

        component.pageSelected(2);
        expect(component.activePage).toEqual(2);

        component.pageSelected(2000);
        expect(component.activePage).toEqual(40);
    });
});
