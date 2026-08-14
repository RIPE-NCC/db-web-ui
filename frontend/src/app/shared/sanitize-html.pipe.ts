import { Pipe, PipeTransform } from '@angular/core';
import sanitizeHtml from 'sanitize-html';

@Pipe({
    name: 'sanitizeHtml',
    standalone: true,
})
export class SanitizeHtmlPipe implements PipeTransform {
    transform(value: string): string {
        return sanitizeHtml(value, {
            allowedTags: sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'img'),
            allowedAttributes: {
                a: ['href', 'target', 'rel'],
            },
        });
    }
}
