import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { PropertiesService } from '../properties.service';
import { LabelPipe } from '../shared/label.pipe';
import { InverseAttrsEnum } from './inverse-attrs.enum';
import { ObjectTypesEnum } from './object-types.enum';
import { IQueryParameters } from './query-parameters.service';
import { TypeOfSearchTermEnum } from './type-of-search-term.enum';

@Component({
    selector: 'inverse-lookup-panel',
    templateUrl: './inverse-lookup-panel.component.html',
    imports: [NgIf, MatCheckbox, FormsModule, LabelPipe],
})
export class InverseLookupPanelComponent implements OnInit {
    @Input()
    public availableTypes: string[];
    @Input()
    public typeOfSearchedTerm: string[];
    @Input()
    public queryParameters: IQueryParameters;
    @Output()
    public queryParametersChange = new EventEmitter<IQueryParameters>();
    readonly InverseAttrsEnum = InverseAttrsEnum;
    public mapInverseLookupAttributesWithTypes: Map<string, string[]>;
    public isMobileView = PropertiesService.isMobileView();

    ngOnInit(): void {
        this.mapInverseLookupAttributesWithTypes = InverseLookupPanelComponent.mapInverseLookupAttributesToTypes();
    }

    public isDisabled(attribute: InverseAttrsEnum) {
        let attrVisibleForTypes: string[] = this.mapInverseLookupAttributesWithTypes.get(attribute);
        if (this.typeOfSearchedTerm.length > 0) {
            // email, neserver, any from TypeOfSearchTermEnum
            return !this.typeOfSearchedTerm.some((type) => attrVisibleForTypes.includes(type));
        } else if (this.availableTypes.length < Object.values(ObjectTypesEnum).length) {
            // recognised some objects, not all, from ObjectTypesEnum
            return !this.availableTypes.some((type) => attrVisibleForTypes.includes(type));
        } else {
            return false;
        }
    }

    private static mapInverseLookupAttributesToTypes() {
        return new Map<string, string[]>([
            [InverseAttrsEnum.ABUSE_C, [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE]],
            [InverseAttrsEnum.ABUSE_MAILBOX, [TypeOfSearchTermEnum.EMAIL]],
            [InverseAttrsEnum.ADMIN_C, [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE]],
            [InverseAttrsEnum.AUTH, [ObjectTypesEnum.KEY_CERT]],
            [InverseAttrsEnum.AUTHOR, [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE]],
            [InverseAttrsEnum.FINGERPR, []],
            [InverseAttrsEnum.FORM, []],
            [InverseAttrsEnum.IRT_NFY, [TypeOfSearchTermEnum.EMAIL]],
            [InverseAttrsEnum.LOCAL_AS, [ObjectTypesEnum.AUT_NUM]],
            [InverseAttrsEnum.MBRS_BY_REF, []],
            [InverseAttrsEnum.MEMBER_OF, []],
            [InverseAttrsEnum.MNT_BY, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.MNT_DOMAINS, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.MNT_IRT, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.MNT_LOWER, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.MNT_NFY, [TypeOfSearchTermEnum.EMAIL]],
            [InverseAttrsEnum.MNT_REF, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.MNT_ROUTES, [ObjectTypesEnum.MNTNER]],
            [InverseAttrsEnum.NOTIFY, [TypeOfSearchTermEnum.EMAIL]],
            [InverseAttrsEnum.NSERVER, [TypeOfSearchTermEnum.NSERVER]],
            [InverseAttrsEnum.ORG, [ObjectTypesEnum.ORGANISATION]],
            [InverseAttrsEnum.ORIGIN, [ObjectTypesEnum.AUT_NUM]],
            [InverseAttrsEnum.PERSON, [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE]],
            [InverseAttrsEnum.PING_HDL, [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE]],
            [InverseAttrsEnum.REF_NFY, [TypeOfSearchTermEnum.EMAIL]],
            [InverseAttrsEnum.SPONSORING_ORG, [ObjectTypesEnum.ORGANISATION]],
            [InverseAttrsEnum.TECH_C, [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE]],
            [InverseAttrsEnum.UPD_TO, [TypeOfSearchTermEnum.EMAIL]],
            [InverseAttrsEnum.ZONE_C, [ObjectTypesEnum.PERSON, ObjectTypesEnum.ROLE]],
        ]);
    }
}
