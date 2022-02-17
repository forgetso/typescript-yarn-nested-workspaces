import {package1} from '@demo/package1'
export function package2() {
    console.log("this is package 2 calling package 1")
    package1()
}

package2()