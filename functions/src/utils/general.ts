function removeUndefinedNullsFromObjDeep(object: any) {
  Object.keys(object).forEach(key => {
    if (Array.isArray(object[key])) {
      object[key] = object[key].filter((it: any) => typeof (it) === "object" ? (Object.keys(it).length > 0) && (it.value !== undefined) && (it.value !== null) && (it.value.length > 0) : (it !== null && it !== undefined && it.length > 0));
    }

    if (object[key] === null || object[key] === undefined || object[key].length === 0) {
      delete object[key];
    }
  });
  delete object.project;
  return object;
}

function customObjectToJson(customObject: object) {
  return Object.assign({}, customObject);
}

module.exports = {
  removeUndefinedNullsFromObjDeep,
  customObjectToJson
}
