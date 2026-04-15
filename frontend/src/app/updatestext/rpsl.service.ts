import { Injectable } from '@angular/core';
import { IAttributeModel } from '../shared/whois-response-type.model';

export interface IRpslObject {
    attributes: IAttributeModel[];
    override?: string;
    deleteReason?: string;
}

@Injectable({ providedIn: 'root' })
export class RpslService {
    private TOTAL_ATTR_LENGTH: number = 15;

    public toRpsl(obj: IRpslObject) {
        let spacing: number = 0;

        // If the first attribute of an object has no value, we are composing a new template.
        // In this case we should use padding (max 15 spaces)
        // otherwise we will inherit existing formatting
        const f = obj.attributes[0];
        if (f !== undefined) {
            if (f.value === undefined || f.value.length === 0 || f.value === 'AUTO-1') {
                spacing = this.TOTAL_ATTR_LENGTH;
            }
        }

        let rpslData = '';
        (obj.attributes ?? []).forEach((item) => {
            rpslData = rpslData.concat(`${item.name}:`.padEnd(spacing, ' '));
            if (item.value !== undefined) {
                rpslData = rpslData.concat(item.value);
            }
            if (item.comment !== undefined) {
                rpslData = rpslData.concat(' # ' + item.comment);
            }

            rpslData = rpslData.concat('\n');
        });

        if (obj.deleteReason !== undefined) {
            rpslData = rpslData.concat('delete:' + obj.deleteReason + '\n');
        }

        if (obj.override !== undefined) {
            rpslData = rpslData.concat('override:' + obj.override + '\n');
        }

        return rpslData;
    }

    public fromRpsl(rpslText: string) {
        const objs: IRpslObject[] = [];

        (rpslText.split('\n\n') ?? []).forEach((objRpsl) => {
            if (objRpsl !== '') {
                const overrides: string[] = [];
                const deleteReasons: string[] = [];

                const obj: IRpslObject = {
                    attributes: this.parseSingleObject(objRpsl, overrides, deleteReasons),
                    deleteReason: undefined,
                    override: undefined,
                };

                this.stripDuplicates(overrides);
                if (overrides.length > 0) {
                    obj.override = overrides[0];
                }

                this.stripDuplicates(deleteReasons);
                this.stripDuplicates(deleteReasons);
                if (deleteReasons.length > 0) {
                    obj.deleteReason = deleteReasons[0];
                }
                objs.push(obj);
            }
        });
        return objs;
    }

    private stripDuplicates(array: string[]) {
        const uniqued = [...new Set(array ?? [])];
        // don't copy into a new pointer, but leave existing pointer in tact
        while (array.length) {
            array.pop();
        }
        (uniqued ?? []).forEach((item) => {
            array.push(item);
        });
    }

    private parseSingleObject(rpslText: string, overrides: string[], deleteReasons: string[]) {
        const attrs: IAttributeModel[] = [];

        let buffer = '';
        for (let idx = 0; idx < rpslText.length; idx++) {
            const current = rpslText.charAt(idx);
            const next = rpslText.charAt(idx + 1);

            buffer += current;

            // newline followed by alpha-numeric character is attribute separator
            if (idx === rpslText.length - 1 || (current === '\n' && this.isLetter(next))) {
                // end of attribute reached
                const attr = this.parseSingleAttribute(structuredClone(buffer));
                if (attr !== undefined) {
                    const trimmed = attr.value?.trim();
                    if (attr.name === 'override') {
                        if (trimmed.length !== 0) {
                            overrides.push(trimmed);
                        }
                    } else if (attr.name === 'delete') {
                        if (trimmed.length !== 0) {
                            deleteReasons.push(trimmed);
                        }
                    } else {
                        attrs.push(attr);
                    }
                }
                // reset buffer
                buffer = '';
            }
        }

        return attrs;
    }

    private parseSingleAttribute(rawAttribute: any) {
        let attr: IAttributeModel;

        // extract the key
        const keyWithRest = rawAttribute.split(':');
        if (keyWithRest.length > 0 && keyWithRest[0].trim() !== '') {
            const key = keyWithRest?.[0].trim();
            const rest = (keyWithRest ?? []).slice(1).join(':'); // allow colons in value
            const values: string[] = [];
            const comments: string[] = [];

            // extract the value and comment
            if (keyWithRest.length > 1) {
                (rest.split('\n') ?? []).forEach((item) => {
                    values.push(item?.trimEnd());
                });
            }
            attr = {
                comment: this.concatenate(comments, ' '),
                name: key,
                value: this.concatenate(values, ''),
            };
        }
        return attr;
    }

    private concatenate(array: string[], separator: string): string | undefined {
        let combined: string | undefined = undefined;
        for (const item of array) {
            if (item !== undefined) {
                if (combined === undefined) {
                    combined = item;
                } else {
                    combined = combined + separator + item;
                }
            }
        }
        return combined;
    }

    private isLetter(letter: string): boolean {
        if (letter.length === 0) {
            return false;
        }
        return letter.toLowerCase() !== letter.toUpperCase();
    }
}
