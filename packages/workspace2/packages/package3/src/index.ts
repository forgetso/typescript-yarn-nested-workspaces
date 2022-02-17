import {package1} from '@demo/package1'
export function package3() {
    console.log("this is package 3 calling package 1")
    package1()
}

package3()