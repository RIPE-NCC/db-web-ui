// Only temporary, until we are shouldn't provide all features on test, rc and training environment
import {Injectable} from "@angular/core";

@Injectable()
export class EnvironmentStatusService {

    public isTrainingEnv(): boolean {
        const host = window.location.host;
        return host.indexOf("training.db.ripe.net") > -1;
    }

    public isTestRcEnv(): boolean {
        const host = window.location.host;
        console.log("checking", host);
        return host.indexOf("apps-test.db.ripe.net") > -1
            || host.indexOf("rc.db.ripe.net") > -1;
    }
}
