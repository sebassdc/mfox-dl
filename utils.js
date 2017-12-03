// @ts-check
const request = require('request');
const fs = require('fs');
const path = require('path')
const mangaFox = require('node-mangafox');
const $ = require('node-mangafox/jquack')
const yazl = require("yazl");
const del = require('del')
const log = console.log

const searchManga = str => {
  const query = str.replace("'", "").replace(" ", "+");
  let data = "";
  request({
    url: `http://mangafox.me/ajax/search.php?term=${query}`,
    headers: {
      'Host': 'mangafox.me',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': `http://mangafox.me/search.php?name=${query}`,
      'X-Requested-With': 'XMLHttpRequest',
    }
  })
  .on('data', chunk => {
    data += chunk;
  })
  .on('end', () => {
    const info = JSON.parse(data)
      .map(([id, name, urlName, tags, author]) => ({id, name, urlName, tags, author}))
    console.log(info)
  })
}

const progressBar = ({
  overallPercent = Number(),
  width = 20,
  complete="=",
  incomplete="·"
}) => {
  const discretPerc = Math.round(width * overallPercent)
  const completed = Array(discretPerc).fill(complete).join("")
  const incompleted = Array(width - discretPerc).fill(incomplete).join("")
  return completed + incompleted;
}

const progressiveBar = ({
  value,
  length=40,
  title = " ",
  vmin=0.0,
  vmax=1.0,
  progressive = false
}) => {
  // Block progression is 1/8
  const blocks = ["", "▏","▎","▍","▌","▋","▊","▉","█"]
  const lsep = "▏", rsep = "▕"
  
  // Normalize value
  const normalized_value = (Math.min(Math.max(value, vmin), vmax)-vmin)/Number(vmax-vmin)
  const v = normalized_value * length
  const x = Math.floor(v) // integer part
  const y = v - x         // fractional part
  const i = Math.round(y*8)
  const bar = Array(x).fill("█").join("") + blocks[i]
  const remaining = Array(length - bar.length).fill(" ").join("")
  return `${title} ${lsep}${bar}${!progressive ? remaining : ""}${rsep} ${(Math.round(normalized_value * 100 * 100) / 100)}%`
}

const getPageUrl = (manga, ch, page) => new Promise((resolve, reject) => {
  const url_to_parse = `http://mangafox.me/manga/${mangaFox.fixTitle(manga)}/v01/c${mangaFox.pad(ch,3)}/${page}.html`;
  $.get(url_to_parse, d => {
    resolve(d.find('#viewer img').attr('src'))
  }, true)
})

const getFilename = n => `${n.toString().padStart(4, "0")}.jpg`

const zipFolder = p =>  new Promise((resolve, reject) => {
  if (!fs.existsSync(p)) {
    throw Error("Zipping error: The path doesn't exist")
  }
  fs.readdir(p, (err, files) => {
    if (err) {
      reject(err)
    }
    let zipfile = new yazl.ZipFile();
    zipfile.outputStream.pipe(fs.createWriteStream(`${p}.cbz`)).on("close", () => {
      del.sync(p)
      resolve()
    });
    files.map(e => path.join(p, e)).forEach(img => {
      zipfile.addFile(img, img);
    })
    zipfile.end()
  })
})

module.exports = {
  progressBar,
  progressiveBar,
  searchManga,
  getPageUrl,
  getFilename,
  zipFolder,
}