import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DropdownComponent } from 'src/app/shared/dropdown/dropdown.component';
import { DropdownOption } from 'src/app/shared/dropdown/types';

describe('DropdownComponent', () => {
    let component: DropdownComponent;
    let fixture: ComponentFixture<DropdownComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    const mockOptions: DropdownOption[] = [
        {
            label: 'Role and maintainer pair',
            value: 'role-mnt',
        },
        {
            label: 'AS Block',
            value: 'as-block',
        },
        {
            label: 'AS Set',
            value: 'as-set',
        },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DropdownComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DropdownComponent);
        component = fixture.componentInstance;

        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();

        component.label = 'Object type';
        component.options = mockOptions;
        component.selectedValue = 'role-mnt';

        fixture.detectChanges();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render label', () => {
        const label = fixture.debugElement.query(By.css('.dropdown-label'));

        expect(label.nativeElement.textContent).toContain('Object type');
    });

    it('should render selected label', () => {
        const trigger = fixture.debugElement.query(By.css('.dropdown-trigger'));

        expect(trigger.nativeElement.textContent).toContain('Role and maintainer pair');
    });

    it('should open dropdown on trigger click', () => {
        const trigger = fixture.debugElement.query(By.css('.dropdown-trigger'));

        trigger.nativeElement.click();

        fixture.detectChanges();

        expect(component.isOpen).toBeTrue();

        const items = overlayContainerElement.querySelectorAll('.dropdown-item');

        expect(items.length).toBe(3);
    });

    it('should render all options', () => {
        component.isOpen = true;

        fixture.detectChanges();

        const items = overlayContainerElement.querySelectorAll('.dropdown-item');

        expect(items.length).toBe(3);

        expect(items[0].textContent).toContain('Role and maintainer pair');

        expect(items[1].textContent).toContain('AS Block');

        expect(items[2].textContent).toContain('AS Set');
    });

    it('should select option and emit value', () => {
        spyOn(component.selectedValueChange, 'emit');

        component.isOpen = true;

        fixture.detectChanges();

        const items = overlayContainerElement.querySelectorAll('.dropdown-item');

        (items[1] as HTMLButtonElement).click();

        fixture.detectChanges();

        expect(component.selectedValue).toBe('as-block');

        expect(component.selectedValueChange.emit).toHaveBeenCalledWith('as-block');

        expect(component.isOpen).toBeFalse();
    });

    it('should close dropdown', () => {
        component.isOpen = true;

        component.close();

        expect(component.isOpen).toBeFalse();
    });

    it('should return placeholder when no selected value exists', () => {
        component.placeholder = 'Select option';
        component.selectedValue = 'unknown';

        expect(component.selectedLabel).toBe('Select option');
    });

    it('should apply selected class to selected option', () => {
        component.isOpen = true;

        fixture.detectChanges();

        const selectedItem = overlayContainerElement.querySelector('.dropdown-item.selected');

        expect(selectedItem?.textContent).toContain('Role and maintainer pair');
    });
});
