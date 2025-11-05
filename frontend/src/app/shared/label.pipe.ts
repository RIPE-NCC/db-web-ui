import { Pipe, PipeTransform } from '@angular/core';
import { Labels } from '../label.constants';

@Pipe({ name: 'label', standalone: true })
export class LabelPipe implements PipeTransform {
    transform(key: string): string {
        return Labels[key];
    }
}
