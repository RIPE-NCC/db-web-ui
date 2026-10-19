import { Injectable } from '@angular/core';

const IPv6SIZE: string[] = ['', 'K', 'M', 'G', 'T'];

@Injectable({ providedIn: 'root' })
export class IpUsageService {
    calcFreeSpace(total: number, used: number): number {
        return total - used;
    }

    calcShorterValue(value: number): string {
        if (value === undefined) {
            return '';
        }
        let counter = 0;
        while (value >= 1024) {
            value = value / 1024;
            counter++;
        }
        return Math.round(value) + IPv6SIZE[counter];
    }
}
