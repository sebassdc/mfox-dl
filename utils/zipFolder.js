const fs = require('fs')
const path = require('path')
const yazl = require('yazl');
const del = require('del')

module.exports = p =>  new Promise((resolve, reject) => {
  if (!fs.existsSync(p)) {
    throw Error("Zipping error: The path doesn't exist")
  }
  fs.readdir(p, (err, files) => {
    if (err) {
      reject(err)
    }
    let zipfile = new yazl.ZipFile();
    zipfile.outputStream.pipe(fs.createWriteStream(`${p}.cbz`)).on("close", () => {
      setTimeout(() => {
        del.sync(p)
        resolve()
      }, 1000)
    });
    files.map(e => path.join(p, e)).forEach(img => {
      zipfile.addFile(img, img);
    })
    zipfile.end()
  })
})