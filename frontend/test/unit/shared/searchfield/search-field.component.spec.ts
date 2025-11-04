import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SearchFieldComponent } from '../../../../src/app/shared/sreachfield/search-field.component';

describe('SearchFieldComponent', () => {
    let component: SearchFieldComponent;
    let fixture: ComponentFixture<SearchFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchFieldComponent], // standalone component
        }).compileComponents();

        fixture = TestBed.createComponent(SearchFieldComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should display the input and search button', () => {
        fixture.detectChanges();
        const inputEl = fixture.debugElement.query(By.css('input#searchInput'));
        const searchBtn = fixture.debugElement.query(By.css('button.search-button'));

        expect(inputEl).toBeTruthy();
        expect(searchBtn).toBeTruthy();
    });

    it('should emit queryTextChange on input change', () => {
        spyOn(component.queryTextChange, 'emit');
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input#searchInput')).nativeElement;

        inputEl.value = 'test input';
        inputEl.dispatchEvent(new Event('input'));

        expect(component.queryTextChange.emit).toHaveBeenCalledWith('test input');
    });

    it('should show clear button when queryText is not empty', () => {
        component.queryText = 'something';
        fixture.detectChanges();

        const clearBtn = fixture.debugElement.query(By.css('button#clearBtn'));
        expect(clearBtn).toBeTruthy();
    });

    it('should hide clear button when queryText is empty', () => {
        component.queryText = '';
        fixture.detectChanges();

        const clearBtn = fixture.debugElement.query(By.css('button#clearBtn'));
        expect(clearBtn).toBeFalsy();
    });

    it('should clear queryText when clear button is clicked', () => {
        spyOn(component, 'onInputChange');
        component.queryText = 'to be cleared';
        fixture.detectChanges();

        const clearBtn = fixture.debugElement.query(By.css('button#clearBtn'));
        clearBtn.nativeElement.click();
        fixture.detectChanges();

        expect(component.onInputChange).toHaveBeenCalledWith('');
    });
});
