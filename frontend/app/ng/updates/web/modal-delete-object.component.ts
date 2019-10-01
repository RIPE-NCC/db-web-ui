import {Component, Input, OnDestroy} from "@angular/core";
import {Router} from "@angular/router";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {RestService} from "../rest.service";
import {CredentialsService} from "../../shared/credentials.service";

interface IModalDelete {
    name: string;
    objectType: string;
    onCancelPath: string;
    source: string;
}

@Component({
    selector: "modal-delete-object",
    templateUrl: "./modal-delete-object.component.html",
})
export class ModalDeleteObjectComponent {

    public MAX_REFS_TO_SHOW: number = 5;

    @Input()
    public inputData: IModalDelete;

    public reason = "I don\'t need this object";
    public incomingReferences: any;
    public canBeDeleted: any;
    public restCallInProgress = false;
    private isDismissed: boolean = true;

    constructor(private router: Router,
                private activeModal: NgbActiveModal,
                public restService: RestService,
                public credentialsService: CredentialsService) {
    }

    public ngOnInit() {
        this.getReferences(this.inputData.source, this.inputData.objectType, this.inputData.name);
    }

    public ngOnDestroy() {
        if (this.isDismissed) {
            this.dismiss();
        }
    }

    public delete() {
        if (!this.canBeDeleted) {
            return;
        }

        const deleteWithRefs = this.hasNonSelfIncomingRefs(this.inputData.objectType, this.inputData.name, this.incomingReferences);

        let password;
        if (this.credentialsService.hasCredentials()) {
            password = this.credentialsService.getCredentials().successfulPassword;
        }

        this.restService.deleteObject(this.inputData.source, this.inputData.objectType, this.inputData.name, this.reason, deleteWithRefs, password)
            .subscribe((resp: any) => {
                this.isDismissed = false;
                this.activeModal.close(resp);
            }, (error: any) => {
                this.activeModal.dismiss(error);
            },
        );
    }

    public cancel() {
        this.transitionToState(this.inputData.source, this.inputData.objectType, this.inputData.name, this.inputData.onCancelPath);
        this.activeModal.close();
        this.isDismissed = false;
    }
    public dismiss() {
        this.transitionToState(this.inputData.source, this.inputData.objectType, this.inputData.name, this.inputData.onCancelPath);
        this.isDismissed = true;
    }

    public isEqualTo(selfType: string, selfName: string, ref: any) {
        return ref.objectType.toUpperCase() === selfType.toUpperCase() && ref.primaryKey.toUpperCase() === selfName.toUpperCase();
    }

    public displayUrl(ref: any) {
        return `#/webupdates/display/${this.inputData.source}/${ref.objectType}/${encodeURIComponent(ref.primaryKey)}`;
    }

    public isDeletable(parent: any) {
        if (_.isUndefined(parent) || _.isUndefined(parent.objectType)) {
            return false;
        }
        // parent is the object we asked references for
        const objectDeletable = _.every(parent.incoming, (first: any) => {
            // direct incoming references
            if (this.isEqualTo(parent.objectType, parent.primaryKey, first)) {
                // self ref
                console.debug(first.primaryKey + " is first level self-ref");
                return true;
            } else {
                return _.every(first.incoming, (second: any) => {
                    // secondary incoming references
                    if (this.isEqualTo(first.objectType, first.primaryKey, second)) {
                        // self ref
                        console.debug(second.primaryKey + " is second level self-ref");
                        return true;
                    } else if (this.isEqualTo(parent.objectType, parent.primaryKey, second)) {
                        // cross reference with parent
                        console.debug(second.primaryKey + " is second level cross-ref");
                        return true;
                    } else {
                        console.debug(second.primaryKey + " is an external ref");
                        return false;
                    }
                });
            }
        });
        console.debug("objectDeletable:" + objectDeletable);

        return objectDeletable;
    }

    public hasNonSelfIncomingRefs(objectType: string, objectName: string, incomingRefs: any) {
        return _.some(incomingRefs, (ref) => {
            return !this.isEqualTo(objectType, objectName, ref);
        });
    }

    public getReferences(source: string, objectType: string, name: string) {
        this.restCallInProgress = true;
        this.restService.getReferences(source, objectType, name, this.MAX_REFS_TO_SHOW.toString())
            .then((resp: any) => {
                    this.restCallInProgress = false;
                    this.canBeDeleted = this.isDeletable(resp);
                    this.incomingReferences = resp.incoming;
                }, (error: any) => {
                    this.restCallInProgress = false;
                    this.activeModal.dismiss(error.data);
                },
            );
    }

    public transitionToState(source: string, objectType: string, pkey: string, onCancelPath: string) {
        this.router.navigate([onCancelPath, source, objectType, pkey])
    }
}
