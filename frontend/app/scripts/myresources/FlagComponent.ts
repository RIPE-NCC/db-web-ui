class FlagController {

    public static $inject = ["$timeout"];
    public text: string;
    public tooltip: string;
    public isOpen = false;
    public timer: any;

    constructor(private $timeout: any) {
    }

    public in() {
        this.isOpen = true;
        if (this.timer) {
            this.$timeout.cancel(this.timer);
        }
    }

    public out() {
        if (this.isOpen) {
            this.timer = this.$timeout(() => {
                this.isOpen = false;
                this.timer = null;
            }, 66);
        }
    }
}

angular.module("dbWebApp").component("flag", {
    bindings: {
        text: "<",
        tooltip: "<",
    },
    controller: FlagController,
    templateUrl: "scripts/myresources/flag.html",
});
