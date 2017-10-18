interface IFindMaintainer {
    maintainerKey: string;
    selectedMaintainer: IWhoisObjectModel;
    email: string;
    mntnerFound: boolean;
    expired: boolean;
}

class FoundMaintainer implements IFindMaintainer {
    public maintainerKey: string;
    public selectedMaintainer: IWhoisObjectModel;
    public email: string;
    public mntnerFound: boolean;
    public expired: boolean;

    constructor(maintainerKey: string, selectedMaintainer: IWhoisObjectModel, expired: boolean) {
        this.mntnerFound = true;
        this.maintainerKey = maintainerKey;
        this.selectedMaintainer = selectedMaintainer;
        this.expired = expired;
        this.email = this.selectedMaintainer.attributes.attribute
            .filter((attr) => attr.name.toLocaleLowerCase() === "upd-to")[0]
            .value;
    }
}
