import {Injectable} from "@angular/core";

@Injectable()
export class JsUtilService {

    /**
     * Checks the types of args against an array of expected JS types and throws a
     * TypeError if not. Uses the types returned by JsUtilService.typeOf(obj) rather
     * than Javascript"s own.
     *
     * @param args JS built-in "arguments"
     * @param types String array of type names returned by typeOf
     */
    public checkTypes(args: any[], types: any) {
        args = [].slice.call(args);
        for (let i = 0; i < types.length; ++i) {
            if (this.typeOf(args[i]) !== types[i]) {
                throw new TypeError([
                    "checkTypes: param ", i,
                    " must be of type ", types[i],
                    " but was ", this.typeOf(args[i])]
                    .join(""));
            }
        }
    }

    /**
     * Returns a string which describes the /internal/ Javascript name for the type, rather
     * than the one which comes from "typeof". This way we can identify a much wider range
     * of objects.
     *
     * @param obj Any JS object
     * @returns {string} Description of the JS type
     */
    public typeOf(obj: any) {
        return {}.toString.call(obj).match(/\s(\w+)/)[1].toLowerCase();
    }
}
