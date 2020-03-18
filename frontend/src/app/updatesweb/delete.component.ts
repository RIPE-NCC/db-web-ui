import {Component, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalDeleteObjectComponent} from "./modal-delete-object.component";
import {AlertsComponent} from "../shared/alert/alerts.component";

@Component({
    selector: "delete-component",
    templateUrl: "./delete.component.html",
})
export class DeleteComponent {

    public modalInProgress: boolean;
    public source: string;
    public objectType: string;
    public name: string;
    public onCancel: string;
    public deletedObjects: any;

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(private modalService: NgbModal,
                private activatedRoute: ActivatedRoute) {
        // this page does not raise a modal for authentication. It can be user directly either
        // if you are logged in and the object has your maintainers or if you have provided password
        // in the modify screen
        // TODO [TP]: modularise the authentication logic from createController and use it both in create/modify and in delete
    }

    public ngOnInit() {
        this.modalInProgress = true;

        this.alertsComponent.clearErrors();

        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.source = paramMap.get("source");
        this.objectType = paramMap.get("objectType");
        this.name = decodeURIComponent(paramMap.get("objectName"));
        this.onCancel = queryParamMap.get("onCancel");

        console.debug("Url params: source:" + this.source + ". type:" + this.objectType + ", uid:" + this.name);

        this.deletedObjects = [];
        // do not open modals on init
        Promise.resolve().then(() =>  this.deleteObject());
    }

    public deleteObject() {
        console.debug("deleteObject called");
        const inputData = {
            name: this.name,
            objectType: this.objectType,
            onCancelPath: this.onCancel,
            source: this.source
        };
        const modalRef = this.modalService.open(ModalDeleteObjectComponent);
        modalRef.componentInstance.inputData = inputData;
        modalRef.result.then((whoisResources: any) => {
            this.modalInProgress = false;
            this.deletedObjects = whoisResources.objects.object;
            console.debug("SUCCESS delete object" + JSON.stringify(whoisResources));
            this.alertsComponent.setGlobalInfo("The following object(s) have been successfully deleted");
        }, (errorResp: any) => {
            this.modalInProgress = false;
            console.debug("ERROR deleting object" + JSON.stringify(errorResp));
            if (errorResp.data) {
                this.alertsComponent.setErrors(errorResp.data);
            }
        });
    }
}
