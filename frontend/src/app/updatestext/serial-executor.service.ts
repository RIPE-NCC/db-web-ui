import {Injectable} from "@angular/core";
import {of} from "rxjs";
import * as _ from "lodash";

@Injectable()
export class SerialExecutorService {

    public execute(data: any, cb: any) {
        // package function and function argument
        const tasks = _.map(data, (item) => {
            return () => {
                return cb(item);
            };
        });

        this.serial(tasks);
    }

    private serial(tasks: any) {
        if (tasks.length === 0) {
            // return right away
            // const deferred = this.$q.defer();
            // deferred.resolve();
            // return deferred.promise;
            return of().toPromise();
        }

        const callWrapper = (index: number) => {
            console.info("Start processing task " + (index + 1) + " of " + tasks.length);
            tasks[index]().then(() => {
                    console.info("Success performing task " + (index + 1) + " of " + tasks.length);
                    const nextIndex = index + 1;
                    if (nextIndex < tasks.length) {
                        return callWrapper(nextIndex);
                    } else {
                        console.info("All tasks processed");
                        return of().toPromise();
                    }
                }, () => {
                    console.error("Error performing task " + (index + 1) + " of " + tasks.length);
                    // go on in case of error
                    const nextIndex = index + 1;
                    if (nextIndex < tasks.length) {
                        return callWrapper(nextIndex);
                    } else {
                        console.info("All tasks processed");
                        return of().toPromise();
                    }
                });

        };
        return callWrapper(0);
    }
}
