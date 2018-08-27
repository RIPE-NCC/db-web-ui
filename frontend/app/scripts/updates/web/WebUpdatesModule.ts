class STATE {
    public static CREATE = "webupdates.create";
    public static SELECT = "webupdates.select";
    public static MODIFY = "webupdates.modify";
    public static DELETE = "webupdates.delete";
    public static DISPLAY = "webupdates.display";
    public static FORCE_DELETE = "webupdates.forceDelete";
    public static FORCE_DELETE_SELECT = "webupdates.forceDeleteSelect";
}

angular.module("webUpdates", ["updates"])
    .constant(STATE);
