import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IQueryFlag {
    longFlag: string;
    shortFlag: string;
    description: string;
}

@Injectable()
export class QueryFlagsService {
    public FLAGS: IQueryFlag[];
    public detectedQueryFlags: IQueryFlag[];

    constructor(private http: HttpClient) {}

    public getFlags(flags: string[]): Observable<IQueryFlag[]> {
        this.detectedQueryFlags = [];
        if (this.FLAGS) {
            return of(this.findFlags(flags));
        } else {
            return this.helpWhois().pipe(
                map((help) => {
                    this.FLAGS = help;
                    return this.findFlags(flags);
                }),
            );
        }
    }

    private helpWhois(): Observable<IQueryFlag[]> {
        return this.http.get<IQueryFlag[]>(`api/metadata/help`);
    }

    private findFlags(flags: string[]): IQueryFlag[] {
        for (let flag of flags) {
            const queryFlag = this.findFlag(flag);
            if (!!queryFlag) {
                this.detectedQueryFlags.push(queryFlag);
            } else if (flag.length > 2) {
                // grouped flags "-i" = 2
                const groupedFlags: string[] = flag.split('');
                groupedFlags.shift();
                this.findFlags(groupedFlags.map((item) => `-${item}`));
            }
        }
        return [...new Set(this.detectedQueryFlags)]; // remove duplicate flags
    }

    private findFlag(flag: string): IQueryFlag {
        return this.FLAGS.find((f) => f.longFlag === flag || f.shortFlag === flag);
    }
}
