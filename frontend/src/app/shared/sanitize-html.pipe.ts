import { Pipe, PipeTransform } from '@angular/core';
import sanitizeHtml from 'sanitize-html';

@Pipe({ name: 'sanitizeHtml' })
export class SanitizeHtmlPipe implements PipeTransform {
    constructor() {}

    public transform(value: string): string {
        return sanitizeHtml(value);
    }
}
