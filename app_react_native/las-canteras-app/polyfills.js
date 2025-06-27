import * as ExpoCrypto from "expo-crypto";

if (typeof global.crypto === "undefined") {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues === "undefined") {
  global.crypto.getRandomValues = function (arr) {
    if (
      !(
        arr instanceof Uint8Array ||
        arr instanceof Uint16Array ||
        arr instanceof Uint32Array
      )
    ) {
      throw new TypeError("Expected an integer array");
    }
    const bytes = ExpoCrypto.getRandomBytes(arr.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = bytes[i];
    }
    return arr;
  };
}