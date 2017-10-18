class LabelFilter {
    public static lookup(Labels: { [key: string]: string }): (key: string) => string {
        return (key: string) => {
            return Labels[key];
        };
    }
}

angular.module("dbWebApp")
    .filter("label", LabelFilter.lookup);
