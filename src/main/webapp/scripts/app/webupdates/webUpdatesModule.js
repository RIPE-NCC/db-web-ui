angular.module('webUpdates', ['dbWebApp'])
    .constant(
        "STATE", {
        SELECT: "select",
        MODIFY: "modify",
        DELETE: "delete",
        DISPLAY: "display",
        RECLAIM: "reclaim",
        RECLAIM_SELECT: "reclaimSelect"
});
