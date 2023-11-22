import { Directive, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Diff, DiffMatchPatchService, DiffOp } from 'ng-diff-match-patch';

// taken from ng-diff-match-patch and expanded with + or - in front of each different row
// https://github.com/elliotforbes/ng-diff-match-patch/blob/master/projects/ng-diff-match-patch/src/lib/lineDiff.directive.ts
@Directive({
    selector: '[whoisLineDiff]',
})
export class WhoisLineDiffDirective implements OnInit, OnChanges {
    @Input()
    left: string | number | boolean;
    @Input()
    right: string | number | boolean;

    public constructor(private el: ElementRef, private dmp: DiffMatchPatchService) {}

    public ngOnInit(): void {
        this.updateHtml();
    }

    public ngOnChanges(): void {
        this.updateHtml();
    }

    private updateHtml(): void {
        if (typeof this.left === 'number' || typeof this.left === 'boolean') {
            this.left = this.left.toString();
        }
        if (typeof this.right === 'number' || typeof this.right === 'boolean') {
            this.right = this.right.toString();
        }
        this.el.nativeElement.innerHTML = this.createHtml(this.dmp.getLineDiff(this.left, this.right));
    }

    private createHtml(diffs: Array<Diff>): string {
        let html: string;
        html = '<div>';
        for (let diff of diffs) {
            if (diff[0] === DiffOp.Equal) {
                html += `<span class="equal">${diff[1]}</span>`;
            }
            if (diff[0] === DiffOp.Delete) {
                const rowsDiff = diff[1].split(/\r\n|\r|\n/);
                rowsDiff.pop();
                for (let row of rowsDiff) {
                    html += `<div class=\"del\"><del> - ${row} </del></div>\n`;
                }
            }
            if (diff[0] === DiffOp.Insert) {
                const rowsDiff = diff[1].split(/\r\n|\r|\n/);
                rowsDiff.pop();
                for (let row of rowsDiff) {
                    html += `<div class=\"ins\"><ins> + ${row} </ins></div>\n`;
                }
            }
        }
        html += '</div>';
        return html;
    }
}
