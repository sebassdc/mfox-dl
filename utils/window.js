const request = require('request')
const zlib = require('zlib')
const { JSDOM } = require('jsdom')

const getHtml = url => new Promise((resolve, reject) => {
  const req = request({
    url,
    headers: {
      "accept-encoding" : "gzip,deflate",
    }
  })

  req.on('response', res => {
    let chunks = []
    req
      .on('error', err => {
        reject(err)
      })
      .on('data', c => {
        chunks.push(c)
      })
      .on('end', () => {
        const buffer = Buffer.concat(chunks)
        const encoding = res.headers['content-encoding']
        if (encoding === 'gzip') {
          zlib.gunzip(buffer, (err, decoded) => {
            if (err) reject(err)
            resolve(decoded && decoded.toString())
          })
        } else if (encoding === 'deflate') {
          zlib.inflate(buffer, (err, decoded) => {
            if (err) reject(err)
            resolve(decoded && decoded.toString())
          })
        } else {
          resolve(buffer && buffer.toString())
        }
      })
  })
})

const debugDom = dom => {
  const main = dom.window.document.getElementsByClassName("main")[0]
  console.log(main)
  return dom
}

const debugData = data => {
  console.log("Data: ", data)
  return data
}

const docCreator = url => getHtml(url)
  // .then(debugData)
  .then(data => new JSDOM(data))
  // .then(debugDom)
  .then(dom => dom.window.document)


const getPagesNumber = doc => (doc.querySelectorAll('.l option').length - 2) / 2


module.exports = {
  docCreator,
  getPagesNumber,
}