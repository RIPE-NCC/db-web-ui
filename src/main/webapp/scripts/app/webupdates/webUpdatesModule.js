angular.module('webUpdates', ['dbWebApp'])
    .constant(
        "STATE", {
        CREATE: "webupdates.create",
        SELECT: "webupdates.select",
        MODIFY: "webupdates.modify",
        DELETE: "webupdates.delete",
        DISPLAY: "webupdates.display",
        RECLAIM: "webupdates.reclaim",
        RECLAIM_SELECT: "webupdates.reclaimSelect"
});
