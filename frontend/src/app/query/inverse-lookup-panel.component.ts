import {Component, Input, Output, EventEmitter, OnInit} from "@angular/core";
import {IQueryParameters} from "./query-parameters.service";
import {InverseAttrsEnum} from "./inverse-attrs.enum";
import {ObjectTypesEnum} from "./object-types.enum";

@Component({
    selector: "inverse-lookup-panel",
    templateUrl: "./inverse-lookup-panel.component.html",
})
export class InverseLookupPanelComponent implements OnInit {

    @Input()
    public availableTypes: string[];
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    readonly InverseAttrsEnum = InverseAttrsEnum;
    public mapInverseLookupAttributesWithTypes: Map<string, string[]>;

    ngOnInit(): void {
        this.mapInverseLookupAttributesWithTypes = InverseLookupPanelComponent.mapInverseLookupAttributesToTypes();
    }

    public isDisabled(attribute: InverseAttrsEnum) {
        let attrVisibleForTypes: string[] = this.mapInverseLookupAttributesWithTypes.get(attribute);
        let disabled = !this.availableTypes.some(type => attrVisibleForTypes.includes(type));
        if (disabled) {
            this.uncheckDisabledCheckbox(attribute);
        }
        return disabled;
    }

    private uncheckDisabledCheckbox(attribute: InverseAttrsEnum) {
        let enumKey = Object.keys(InverseAttrsEnum)[Object.values(InverseAttrsEnum).indexOf(attribute)];
        this.queryParameters.inverse[enumKey] = false;
    }

    private static mapInverseLookupAttributesToTypes() {
        return new Map<string, string[]>([
            [InverseAttrsEnum.ABUSE_C, [ObjectTypesEnum.AUT_NUM, ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM, ObjectTypesEnum.ORGANISATION]],
            [InverseAttrsEnum.ABUSE_MAILBOX, [ObjectTypesEnum.ROLE]],
            [InverseAttrsEnum.ADMIN_C, [ObjectTypesEnum.AS_SET, ObjectTypesEnum.AUT_NUM, ObjectTypesEnum.DOMAIN,
                ObjectTypesEnum.FILTER_SET, ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM, ObjectTypesEnum.INET_RTR,
                ObjectTypesEnum.IRT, ObjectTypesEnum.KEY_CERT, ObjectTypesEnum.MNTNER, ObjectTypesEnum.ORGANISATION,
                ObjectTypesEnum.PEERING_SET, ObjectTypesEnum.POETIC_FORM, ObjectTypesEnum.ROLE, ObjectTypesEnum.ROUTE_SET,
                ObjectTypesEnum.RTR_SET]],
            [InverseAttrsEnum.AUTH, [ObjectTypesEnum.IRT, ObjectTypesEnum.MNTNER, ObjectTypesEnum.POEM]],
            [InverseAttrsEnum.AUTHOR, [ObjectTypesEnum.POEM]],
            [InverseAttrsEnum.FINGERPR, [ObjectTypesEnum.KEY_CERT]],
            [InverseAttrsEnum.FORM, [ObjectTypesEnum.POEM]],
            [InverseAttrsEnum.IRT_NFY, [ObjectTypesEnum.IRT]],
            [InverseAttrsEnum.LOCAL_AS, [ObjectTypesEnum.INET_RTR]],
            [InverseAttrsEnum.MBRS_BY_REF, [ObjectTypesEnum.AS_SET, ObjectTypesEnum.ROUTE_SET, ObjectTypesEnum.RTR_SET]],
            [InverseAttrsEnum.MEMBER_OF, [ObjectTypesEnum.AUT_NUM, ObjectTypesEnum.INET_RTR, ObjectTypesEnum.ROUTE, ObjectTypesEnum.ROUTE6]],
            [InverseAttrsEnum.MNT_BY, Object.values(ObjectTypesEnum)],
            [InverseAttrsEnum.MNT_DOMAINS, [ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM]],
            [InverseAttrsEnum.MNT_IRT, [ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM]],
            [InverseAttrsEnum.MNT_LOWER, [ObjectTypesEnum.AS_BLOCK, ObjectTypesEnum.AS_SET,
                ObjectTypesEnum.FILTER_SET, ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM, ObjectTypesEnum.PEERING_SET,
                ObjectTypesEnum.ROUTE, ObjectTypesEnum.ROUTE6, ObjectTypesEnum.ROUTE_SET, ObjectTypesEnum.RTR_SET]],
            [InverseAttrsEnum.MNT_NFY, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.MNT_REF, [ObjectTypesEnum.ORGANISATION]],
            [InverseAttrsEnum.MNT_ROUTES, [ObjectTypesEnum.ROUTE, ObjectTypesEnum.ROUTE6,
                ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM]],
            [InverseAttrsEnum.NOTIFY, Object.values(ObjectTypesEnum)],
            [InverseAttrsEnum.NSERVER, [ObjectTypesEnum.DOMAIN]],
            [InverseAttrsEnum.ORG, [ObjectTypesEnum.AS_BLOCK, ObjectTypesEnum.AS_SET, ObjectTypesEnum.AUT_NUM,
                ObjectTypesEnum.DOMAIN, ObjectTypesEnum.FILTER_SET, ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM,
                ObjectTypesEnum.INET_RTR, ObjectTypesEnum.IRT, ObjectTypesEnum.KEY_CERT, ObjectTypesEnum.MNTNER,
                ObjectTypesEnum.ORGANISATION, ObjectTypesEnum.PEERING_SET, ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE,
                ObjectTypesEnum.ROUTE, ObjectTypesEnum.ROUTE6, ObjectTypesEnum.ROUTE_SET, ObjectTypesEnum.RTR_SET]],
            [InverseAttrsEnum.ORIGIN, [ObjectTypesEnum.ROUTE, ObjectTypesEnum.ROUTE6]],
            [InverseAttrsEnum.PERSON, [ObjectTypesEnum.PERSON]],
            [InverseAttrsEnum.PING_HDL, [ObjectTypesEnum.ROUTE, ObjectTypesEnum.ROUTE6]],
            [InverseAttrsEnum.REF_NFY, [ObjectTypesEnum.ORGANISATION]],
            [InverseAttrsEnum.TECH_C, [ObjectTypesEnum.AS_SET, ObjectTypesEnum.AUT_NUM, ObjectTypesEnum.DOMAIN,
                ObjectTypesEnum.FILTER_SET, ObjectTypesEnum.INET6NUM, ObjectTypesEnum.INETNUM, ObjectTypesEnum.INET_RTR,
                ObjectTypesEnum.IRT, ObjectTypesEnum.KEY_CERT, ObjectTypesEnum.MNTNER, ObjectTypesEnum.ORGANISATION,
                ObjectTypesEnum.PEERING_SET, ObjectTypesEnum.ROLE, ObjectTypesEnum.RTR_SET]],
            [InverseAttrsEnum.UPD_TO, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.ZONE_C, [ObjectTypesEnum.DOMAIN]]
        ]);
    }
}
