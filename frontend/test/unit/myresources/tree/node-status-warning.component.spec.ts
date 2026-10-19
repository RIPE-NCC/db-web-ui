import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NodeStatusWarningComponent } from 'src/app/myresources/tree/node-status-warning/node-status-warning.component';

@Component({
    standalone: true,
    imports: [NodeStatusWarningComponent],
    template: `
        <node-status-warning [title]="title" [description]="description">
            <span class="projected-content">Additional content</span>
        </node-status-warning>
    `,
})
class TestHostComponent {
    title = 'Warning title';
    description = 'Warning description';
}

describe('NodeStatusWarningComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should display the title', () => {
        const title = fixture.nativeElement.querySelector('.title');

        expect(title.textContent.trim()).toBe('Warning title');
    });

    it('should display the description when provided', () => {
        const description = fixture.nativeElement.querySelector('.description');

        expect(description).toBeTruthy();
        expect(description.textContent.trim()).toBe('Warning description');
    });

    it('should not display the description when it is empty', () => {
        const warningFixture = TestBed.createComponent(NodeStatusWarningComponent);

        warningFixture.componentRef.setInput('title', 'Warning title');
        warningFixture.componentRef.setInput('description', '');
        warningFixture.detectChanges();

        const description = warningFixture.nativeElement.querySelector('.description');

        expect(description).toBeNull();
    });

    it('should render HTML in the description', () => {
        const warningFixture = TestBed.createComponent(NodeStatusWarningComponent);

        warningFixture.componentRef.setInput('title', 'Warning title');
        warningFixture.componentRef.setInput('description', 'Please <strong>check</strong> this resource.');
        warningFixture.detectChanges();

        const description = warningFixture.nativeElement.querySelector('.description');

        expect(description.querySelector('strong')?.textContent).toBe('check');
    });

    it('should display the warning icon', () => {
        const icon = fixture.nativeElement.querySelector('.fa-triangle-exclamation');

        expect(icon).toBeTruthy();
    });

    it('should project additional content', () => {
        const projectedContent = fixture.nativeElement.querySelector('.projected-content');

        expect(projectedContent).toBeTruthy();
        expect(projectedContent.textContent.trim()).toBe('Additional content');
    });
});
