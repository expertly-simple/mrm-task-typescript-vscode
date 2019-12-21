"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mrm_core_1 = require("mrm-core");
function addArrayProperty(fileName, propertyName, element) {
    let extendsArray = mrm_core_1.json(fileName).get(propertyName);
    if (!Array.isArray(extendsArray)) {
        extendsArray = [extendsArray];
    }
    if (!extendsArray.includes(element)) {
        mrm_core_1.json(fileName)
            .set(propertyName, extendsArray.concat(element))
            .save();
    }
}
exports.addArrayProperty = addArrayProperty;
function setScript(pkg, name, script) {
    pkg
        .setScript(name, script)
        .save();
}
exports.setScript = setScript;
function setScripts(pkg, scripts) {
    for (let [key, value] of Object.entries(scripts)) {
        pkg.setScript(key, value);
    }
    pkg.save();
}
exports.setScripts = setScripts;
//# sourceMappingURL=helpers.js.map