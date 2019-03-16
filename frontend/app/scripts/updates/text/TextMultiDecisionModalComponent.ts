class TextMultiDecisionModalController {

    public close: any;
    public dismiss: any;
    public resolve: any;

    public onPoorClicked() {
        this.close({$value: false});
    }

    public onRichClicked() {
        this.close({$value: true});
    }

    public cancel() {
        this.close({$value: false});
    }
}

angular.module("textUpdates")
    .component("textMultiDecisionModal", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: TextMultiDecisionModalController,
        templateUrl: "./multiDecisionModal.html",
});
