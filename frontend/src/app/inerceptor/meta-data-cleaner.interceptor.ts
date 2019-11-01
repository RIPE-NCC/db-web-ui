import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {isObject} from "util";

@Injectable()
export class MetaDataCleanerInterceptor implements HttpInterceptor {

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.body && isObject(req.body)) {
            const newBody = JSON.parse(JSON.stringify(req.body, this.toJsonReplacer));
            const jsonReq: HttpRequest<any> = req.clone({
                body: newBody,
            });
            return next.handle(jsonReq);
        } else {
            return next.handle(req);
        }
    }

    private toJsonReplacer(key: string, value: any): any {
        return "string" == typeof key && "$" === key.charAt(0) && "$" === key.charAt(1) ? undefined : value;
    }
}
