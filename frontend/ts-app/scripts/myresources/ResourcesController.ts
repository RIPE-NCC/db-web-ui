import {Ipv4Resource} from "./ResourceType";

const mockData = ["20030210  62.221.192.0/18 16384   ALLOCATED_PA    https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/62.221.192.0 - 62.221.255.255",
    "20080915	94.126.32.0/21	2048	ALLOCATED_PA	https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/94.126.32.0 - 94.126.39.255",
    "20150902	185.115.144.0/22	1024	ALLOCATED_PA	https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/185.115.144.0 - 185.115.147.255"];

class ResourcesController {
    public static $inject = ["$log", "MyResourcesDataService"];
    public ipv4Resources: Ipv4Resource[];
    public fish = "shows the size in units";

    constructor(private $log: angular.ILogService,
                private resourcesDataService: MyResourcesDataService) {

        this.$log.debug(">>>>", "hey jack");
        for (const str of mockData) {
            const splits = str.split("\t");
            const resource = new Ipv4Resource();
            resource.date = splits[0];
            resource.prefix = splits[1];
            resource.size = parseInt(splits[2], 10);
            resource.status = splits[4];
            resource.editLink = splits[5];
            this.ipv4Resources = [];
            this.ipv4Resources.push(resource);
            this.$log.debug(">>>>", str);
        }
    }

    public editResource(resource: Ipv4Resource) {
        this.$log.debug("edit resource clicked", resource);
    }

}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
