interface ISelectedObjectType {
    objectType: string;
    source: string;
}

class SelectController {
    public static $inject = ["$state", "WhoisResources", "UserInfoService", "Properties"];
    public selected: ISelectedObjectType;
    public objectTypes: string[];
    public loggedIn: boolean;

    constructor(public $state: ng.ui.IStateService,
                public WhoisResources: any,
                public UserInfoService: UserInfoService,
                public Properties: IProperties) {
    }

    /*
     * UI initialisation
     */
    public $onInit() {
        this.objectTypes = this.filterObjectTypes(this.WhoisResources.getObjectTypes());
        this.UserInfoService.getUserOrgsAndRoles().then(() => {
                this.loggedIn = true;
            },
        );
        this.selected = {
            objectType: "person-mntnr",
            source: this.Properties.SOURCE,
        };
    }

    /*
     * Methods called from the html-teplate
     */
    public labelForSource(src: string): string {
        return src === "RIPE" ? "RIPE    production database" : "Test database (currently not available)";
    }

    public navigateToCreate() {
        if (this.selected.objectType === "mntner") {
            this.$state.transitionTo("webupdates.createSelfMnt", {
                source: this.selected.source,
            });
        } else if (this.selected.objectType === "domain") {
            this.$state.transitionTo("webupdates.domainobjectwizard", this.selected);
        } else if (this.selected.objectType === "person-mntnr") {
            this.$state.transitionTo("webupdates.createPersonMntnerPair", this.selected);
        } else {
            this.$state.transitionTo("webupdates.create", this.selected);
        }
    }

    public filterObjectTypes(unfiltered: string[]): string[] {
        return _.filter(unfiltered, (item: string) => {
            return item !== "as-block" && item !== "poem" && item !== "poetic-form";
        });
    }

}

angular.module("webUpdates")
    .component("selectComponent", {
        controller: SelectController,
        templateUrl: "scripts/updates/web/select.html",
    });
