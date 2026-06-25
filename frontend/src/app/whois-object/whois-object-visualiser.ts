import { inject, Injectable } from '@angular/core';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { IAttributeModel } from '../shared/whois-response-type.model';

@Injectable({ providedIn: 'root' })
export class WhoisObjectVisualiser {
    private whoisMetaService = inject(WhoisMetaService);

    private readonly MAX_ATTR_NAME_MASK = '                ';

    getDescription(type: string, attributeName: string) {
        return this.whoisMetaService.getAttributeShortDescription(type, attributeName);
    }

    padding(attr: IAttributeModel): string {
        if (!attr || !attr.name) {
            return;
        }

        const numLeftPads = attr.name.length - this.MAX_ATTR_NAME_MASK.length;
        return this.MAX_ATTR_NAME_MASK.slice(numLeftPads);
    }
}
