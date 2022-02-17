"use strict";
exports.__esModule = true;
exports.package3 = void 0;
var package1_1 = require("@demo/package1");
function package3() {
    console.log("this is package 3 calling package 1");
    (0, package1_1.package1)();
}
exports.package3 = package3;
package3();
//# sourceMappingURL=index.js.map