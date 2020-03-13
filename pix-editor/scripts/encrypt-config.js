const CryptoJS = require("crypto-js");
const fs = require("fs");
const config = require("./config.js");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Key ?", (key) => {
  console.log("encrypting:" +JSON.stringify(config));
  let value = CryptoJS.AES.encrypt(JSON.stringify(config), key).toString();
  console.log(value);
  console.log("décryptage");
  console.log(CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8));
  var ciphered = {encrypted: value};
  fs.writeFileSync("./../app/config-private.js", "export var configPrivate = "+JSON.stringify(ciphered)+";");
  rl.close();
});
