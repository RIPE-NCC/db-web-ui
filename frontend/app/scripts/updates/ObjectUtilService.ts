class ObjectUtilService {
    /**
     * Public functions
     *
     * @param attributes
     * @returns {*|boolean}
     */
    public isLirObject(attributes: any): boolean {
        return this.isAllocation(attributes) || !!_.find(attributes, {name: "org-type", value: "LIR"});
    }

    /**
     * Hide my privates
     *
     * @param attributes
     * @returns {*}
     */
    private isAllocation(attributes: any): boolean {
        if (!attributes) {
            return false;
        }
        const allocationStatuses = ["ALLOCATED PA", "ALLOCATED PI", "ALLOCATED UNSPECIFIED", "ALLOCATED-BY-RIR"];
        const status = attributes.getSingleAttributeOnName("status");
        return status && _.includes(allocationStatuses, status.value.trim());
    }
}

angular.module("updates").service("ObjectUtilService", ObjectUtilService);
