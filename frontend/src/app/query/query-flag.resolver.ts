import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { QueryFlagsService } from './query-flags.service';

export const queryFlagResolver: ResolveFn<void> = (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    return inject(QueryFlagsService).loadFlags();
};
