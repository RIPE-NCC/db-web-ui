interface IRpslObject {
    attributes: IAttributeModel[];
    override?: string;
    passwords?: string[];
    deleteReason?: string;
}

class RpslService {

    private TOTAL_ATTR_LENGTH: number = 15;

    public toRpsl(obj: IRpslObject) {
        let spacing: number = 0;

        // If the first attribute of an object has no value, we are composing a new template.
        // In tghis case we should using padding (max 15 spaces)
        // otherwise we will inherit existing formatting
        const f = _.first(obj.attributes);
        if (!_.isUndefined(f)) {
            if ((_.isUndefined(f.value) || _.isEmpty(f.value)) || f.value === "AUTO-1") {
                spacing = this.TOTAL_ATTR_LENGTH;
            }
        }

        let rpslData = "";
        _.each(obj.attributes, (item) => {
            rpslData = rpslData.concat(_.padRight(item.name + ":", spacing, " "));
            if (!_.isUndefined(item.value)) {
                rpslData = rpslData.concat(item.value);
            }
            if (!_.isUndefined(item.comment)) {
                rpslData = rpslData.concat(" # " + item.comment);
            }

            rpslData = rpslData.concat("\n");
        });

        if (!_.isUndefined(obj.deleteReason)) {
            rpslData = rpslData.concat("delete:" + obj.deleteReason + "\n");
        }

        if (!_.isUndefined(obj.passwords) && obj.passwords.length > 0) {
            _.each(obj.passwords, (pwd) => {
                rpslData = rpslData.concat("password:" + pwd + "\n");
            });
        }

        if (!_.isUndefined(obj.override)) {
            rpslData = rpslData.concat("override:" + obj.override + "\n");
        }

        return rpslData;
    }

    public fromRpsl(rpslText: string) {
        const objs: IRpslObject[] = [];

        _.each(rpslText.split("\n\n"), (objRpsl) => {
            if (objRpsl !== "") {
                const passwords: string[] = [];
                const overrides: string[] = [];
                const deleteReasons: string[] = [];

                const obj: IRpslObject = {
                    attributes: this._parseSingleObject(objRpsl, passwords, overrides, deleteReasons),
                    deleteReason: undefined,
                    override: undefined,
                    passwords: [],
                };

                this._stripDuplicates(passwords);
                if (passwords.length > 0) {
                    obj.passwords = passwords;
                }

                this._stripDuplicates(overrides);
                if (overrides.length > 0) {
                    obj.override = overrides[0];
                }

                this._stripDuplicates(deleteReasons);
                this._stripDuplicates(deleteReasons);
                if (deleteReasons.length > 0) {
                    obj.deleteReason = deleteReasons[0];
                }
                objs.push(obj);
            }
        });
        return objs;
    }

    private _stripDuplicates(array: string[]) {

        const uniqued = _.uniq(_.clone(array));
        // don"t copy into a new pointer, but leave existibg pointer in tact
        while (array.length) {
            array.pop();
        }
        _.each(uniqued, (item) => {
            array.push(item);
        });
    }

    private _parseSingleObject(rpslText: string, passwords: string[], overrides: string[], deleteReasons: string[]) {
        const attrs: IAttributeModel[] = [];

        let buffer = "";
        for (let idx = 0; idx < rpslText.length; idx++) {
            const current = rpslText.charAt(idx);
            const next = rpslText.charAt(idx + 1);

            buffer += current;

            // newline followed by alpha-numeric character is attribute separator
            if (idx === rpslText.length - 1 || (current === "\n" && this._isLetter(next))) {
                // end of attribute reached
                const attr = this._parseSingleAttribute(_.clone(buffer));
                if (!_.isUndefined(attr)) {
                    const trimmed = _.trim(attr.value);
                    if (attr.name === "password") {
                        if (!_.isEmpty(trimmed)) {
                            passwords.push(trimmed);
                        }
                    } else if (attr.name === "override") {
                        if (!_.isEmpty(trimmed)) {
                            overrides.push(trimmed);
                        }
                    } else if (attr.name === "delete") {
                        if (!_.isEmpty(trimmed)) {
                            deleteReasons.push(trimmed);
                        }
                    } else {
                        attrs.push(attr);
                    }
                }
                // reset buffer
                buffer = "";
            }
        }

        return attrs;
    }

    private _parseSingleAttribute(rawAttribute: any) {
        let attr: IAttributeModel;

        // extract the key
        const keyWithRest = rawAttribute.split(":");
        if (keyWithRest.length > 0 && !_.isEmpty(_.trim(keyWithRest[0]))) {
            const key = _.trim(_.head(keyWithRest));
            const rest = _.tail(keyWithRest).join(":"); // allow colons in value
            const values: string[] = [];
            const comments: string[] = [];

            // extract the value and comment
            if (keyWithRest.length > 1) {
                _.each(rest.split("\n"), (item) => {
                    const trimmed = _.trim(item);

                    if (!_.isEmpty(trimmed)) {
                        if (item.indexOf("#") < 0) { // no comment
                            // keep left spacing for value
                            values.push(_.trimRight(item));
                        } else if (_.startsWith(trimmed, "#")) { // only comment
                            // trim comment
                            comments.push(_.trim(trimmed.substring(1)));
                        } else { // both value and comment
                            const valueWithComment = item.split("#");
                            // keep left spacing for value
                            values.push(_.trimRight(valueWithComment[0]));
                            // trim comment
                            comments.push(_.trim(valueWithComment[1]));
                        }
                    }
                });
            }
            attr =  {
                comment: this._undefinedForEmpty(this._concatenate(comments, " ")),
                name: key,
                value: this._undefinedForEmpty(this._concatenate(values, "")),
            };
        }
        return attr;
    }

    private _concatenate(array: string[], separator: string) {
        return _.reduce(array, (combined, item) => {
            if (!_.isUndefined(item)) {
                return combined + separator + item;
            }
        });
    }

    private _isLetter(c: string): boolean {
        if (_.isEmpty(c)) {
            return false;
        }
        return c.toLowerCase() !== c.toUpperCase();
    }

    private _undefinedForEmpty(value: any): any {
        if (_.isUndefined(value) || _.isEmpty(_.trim(value))) {
            return undefined;
        }
        return value;
    }
}

angular.module("textUpdates").service("RpslService", RpslService);
