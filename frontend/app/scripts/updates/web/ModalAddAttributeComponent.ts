class ModalAddAttributeController {

    public close: any;
    public dismiss: any;
    public resolve: any;

    public selected: any;
    public items: any;

    public $onInit() {
        this.items = this.resolve.items;
        this.selected = {
            item: this.resolve.items[0],
        };
    }

    public ok() {
        this.close({$value: this.selected.item});
    }

    public cancel() {
        this.dismiss();
    }
}

angular.module("webUpdates")
    .component("modalAddAttribute", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: ModalAddAttributeController,
        templateUrl: "./modalAddAttribute.html",
    });
