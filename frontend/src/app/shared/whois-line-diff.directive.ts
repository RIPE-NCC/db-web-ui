import { Directive, ElementRef, Input, OnChanges, OnInit, inject } from '@angular/core';
import DiffMatchPatch, { Diff } from 'diff-match-patch';
import sanitizeHtml from 'sanitize-html';

@Directive({ selector: '[whoisLineDiff]', standalone: true })
export class WhoisLineDiffDirective implements OnInit, OnChanges {
    private el = inject(ElementRef);

    @Input()
    left: string | number | boolean;
    @Input()
    right: string | number | boolean;
    public dmp: DiffMatchPatch;

    public constructor() {
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

        const html = this.createHtml(this.getLineDiff(this.left, this.right));

        this.el.nativeElement.innerHTML = sanitizeHtml(html, {
            allowedTags: ['div', 'span', 'del', 'ins'],
            allowedAttributes: {
                span: ['class'],
                div: ['class'],
            },
        });
    }

    private getLineDiff(left: string, right: string): Diff[] {
        const chars = this.dmp.diff_linesToChars_(left, right);
        const diffs = this.dmp.diff_main(chars.chars1, chars.chars2, false);
        this.dmp.diff_charsToLines_(diffs, chars.lineArray);
        return diffs;
    }

    private createHtml(diffs: Diff[]): string {
        let html = '<div>';
        for (const diff of diffs) {
            if (diff[0] === DiffMatchPatch.DIFF_EQUAL) {
                html += `<span class="equal">${diff[1]}</span>`;
            }
            if (diff[0] === DiffMatchPatch.DIFF_DELETE) {
                const rowsDiff = diff[1].split(/\r\n|\r|\n/);
                rowsDiff.pop();
                for (const row of rowsDiff) {
                    html += `<div class="del"><del> - ${row} </del></div>\n`;
                }
            }
            if (diff[0] === DiffMatchPatch.DIFF_INSERT) {
                const rowsDiff = diff[1].split(/\r\n|\r|\n/);
                rowsDiff.pop();
                for (const row of rowsDiff) {
                    html += `<div class="ins"><ins> + ${row} </ins></div>\n`;
                }
            }
        }
        html += '</div>';
        return html;
    }
}
