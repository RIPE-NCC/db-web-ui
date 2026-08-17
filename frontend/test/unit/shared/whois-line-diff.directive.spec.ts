import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhoisLineDiffDirective } from 'src/app/shared/whois-line-diff.directive';

@Component({
    standalone: true,
    imports: [WhoisLineDiffDirective],
    template: ` <pre class="diff-element" whoisLineDiff [left]="left" [right]="right"></pre> `,
})
class TestComponent {
    left: string | number | boolean = '';
    right: string | number | boolean = '';
}

describe('WhoisLineDiffDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
    });

    describe('updateHtml', () => {
        it('should render equal content', () => {
            component.left = 'same content';
            component.right = 'same content';

            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('.diff-element');

            expect(element.querySelector('.equal')?.textContent).toBe('same content');
        });

        it('should render deleted and inserted lines', () => {
            component.left = 'old line\n';
            component.right = 'new line\n';

            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('.diff-element');

            expect(element.querySelector('.del')).not.toBeNull();
            expect(element.querySelector('.del')?.textContent).toContain('- old line');

            expect(element.querySelector('.ins')).not.toBeNull();
            expect(element.querySelector('.ins')?.textContent).toContain('+ new line');
        });

        it('should handle multiple changed lines', () => {
            component.left = 'line 1\nline 2\n';
            component.right = 'line 1\nline 3\n';

            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('.diff-element');

            expect(element.querySelector('.equal')?.textContent).toContain('line 1');
            expect(element.querySelector('.del')?.textContent).toContain('- line 2');
            expect(element.querySelector('.ins')?.textContent).toContain('+ line 3');
        });

        it('should sanitize malicious HTML', () => {
            component.left = '<img src="x" onerror="alert(1)">old\n';
            component.right = '<script>alert(1)</script>new\n';

            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('.diff-element');

            expect(element.querySelector('img')).toBeNull();
            expect(element.querySelector('script')).toBeNull();
            expect(element.textContent).toContain('old');
            expect(element.textContent).toContain('new');
        });

        it('should not allow HTML attributes from the input', () => {
            component.left = '<span onclick="alert(1)">old</span>';
            component.right = '<div onmouseover="alert(1)">new</div>';

            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('.diff-element');

            expect(element.querySelector('[onclick]')).toBeNull();
            expect(element.querySelector('[onmouseover]')).toBeNull();
        });

        it('should preserve the diff markup classes', () => {
            component.left = 'old\n';
            component.right = 'new\n';

            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('.diff-element');

            expect(element.querySelector('div.del')).not.toBeNull();
            expect(element.querySelector('div.ins')).not.toBeNull();
            expect(element.querySelector('del')).not.toBeNull();
            expect(element.querySelector('ins')).not.toBeNull();
        });
    });
});
