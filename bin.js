const main = require('.')

let args = process.argv
main()
console.log("Press any key to continue")
process.stdin.once('data', () => console.log('exit'))