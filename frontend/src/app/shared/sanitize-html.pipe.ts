import { Pipe, PipeTransform } from '@angular/core';
import sanitizeHtml from 'sanitize-html';

@Pipe({ name: 'sanitizeHtml', standalone: true })
export class SanitizeHtmlPipe implements PipeTransform {
    constructor() {
        sanitizeHtml.defaults.allowedTags = sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'a');
    }

    public transform(value: string): string {
        return sanitizeHtml(value);
    }
}
