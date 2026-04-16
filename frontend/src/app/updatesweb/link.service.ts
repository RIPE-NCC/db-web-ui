import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LinkService {
    public getLink(source: string, type: string, name: string) {
        return ['<a target="_blank" href="webupdates/display/', source, '/', type, '/', name, '">', name, '</a>'].join('');
    }

    public getModifyUrl(source: string, type: string, name: string) {
        return 'webupdates/display/' + source + '/' + type + '/' + encodeURIComponent(name);
    }

    public getModifyLink(source: string, type: string, name: string) {
        return '<a target="_blank" href="' + this.getModifyUrl(source, type, name) + '">' + name + '</a>';
    }

    public filterAndCreateTextWithLinksForMntners(source: string, mntners: string) {
        const chopped = mntners.match(/[^, ]+/g) ?? [];
        if (chopped === undefined) {
            return mntners;
        }

        if (chopped.length === 1) {
            return this.getLink(source, 'mntner', mntners);
        }

        /*
         * If there are multiple mntners to authenticate against, we remove the ripe mntners
         * because regular users are confused by the presence of RIPE mntners
         */
        const withoutRipeMntners = chopped.filter((name: string) => {
            return !name.startsWith(`${source.toUpperCase()}-NCC`);
        });

        const asLinks = withoutRipeMntners.map((name) => {
            return this.getLink(source, 'mntner', name);
        });

        if (asLinks.length > 1) {
            const linksWithoutLast = (asLinks ?? []).slice(0, -1)?.join(', ');
            return linksWithoutLast + ' or ' + asLinks[asLinks.length - 1];
        } else {
            // should be just one
            return asLinks[0];
        }
    }
}
