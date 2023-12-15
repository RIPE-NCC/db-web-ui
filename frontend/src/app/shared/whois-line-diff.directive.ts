import { Directive, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import DiffMatchPatch, { Diff } from 'diff-match-patch';

@Directive({
    selector: '[whoisLineDiff]',
})
export class WhoisLineDiffDirective implements OnInit, OnChanges {
    @Input()
    left: string | number | boolean;
    @Input()
    right: string | number | boolean;
    public dmp: DiffMatchPatch;

    public constructor(private el: ElementRef) {
        this.dmp = new DiffMatchPatch();
    }

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
        this.el.nativeElement.innerHTML = this.createHtml(this.getLineDiff(this.left, this.right));
    }

    private getLineDiff(left: string, right: string) {
        var chars = this.dmp.diff_linesToChars_(left, right);
        var diffs: DiffMatchPatch.Diff[] = this.dmp.diff_main(chars.chars1, chars.chars2, false);
        this.dmp.diff_charsToLines_(diffs, chars.lineArray);
        return diffs;
    }

    private createHtml(diffs: Array<Diff>): string {
        let html: string;
        html = '<div>';
        for (let diff of diffs) {
            if (diff[0] === DiffMatchPatch.DIFF_EQUAL) {
                html += `<span class="equal">${diff[1]}</span>`;
            }
            if (diff[0] === DiffMatchPatch.DIFF_DELETE) {
                const rowsDiff = diff[1].split(/\r\n|\r|\n/);
                rowsDiff.pop();
                for (let row of rowsDiff) {
                    html += `<div class=\"del\"><del> - ${row} </del></div>\n`;
                }
            }
            if (diff[0] === DiffMatchPatch.DIFF_INSERT) {
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
