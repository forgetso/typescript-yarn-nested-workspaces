"use strict";
exports.__esModule = true;
exports.package2 = void 0;
var package1_1 = require("@demo/package1");
function package2() {
    console.log("this is package 2 calling package 1");
    (0, package1_1.package1)();
}
exports.package2 = package2;
package2();
//# sourceMappingURL=index.js.map