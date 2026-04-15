export const findLastIndex = (attributes, attrTypeName) => {
    const lastIdxOfType = [...attributes].reverse().findIndex((item) => item.name === attrTypeName);

    return lastIdxOfType === -1 ? -1 : attributes.length - 1 - lastIdxOfType;
};
