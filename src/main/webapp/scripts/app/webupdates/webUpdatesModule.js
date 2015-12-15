angular.module('webUpdates', ['dbWebApp'])
    .constant(
        "STATE", {
        SELECT: "select",
        MODIFY: "modify",
        DELETE: "delete",
        RECLAIM: "reclaim",
        RECLAIM_SELECT: "reclaimSelect"
});
