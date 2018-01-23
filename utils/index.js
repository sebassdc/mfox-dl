// @ts-check
const Rx = require('@reactivex/rxjs')
const request = require('request')
const fs = require('fs')
const path = require('path')
const mangaFox = require('node-mangafox')
const $ = require('node-mangafox/jquack')
const del = require('del')
const { log, table } = console
const rss = require('simple-rss')
const {inspect} = require('util')
const {
  docCreator,
  getPagesNumber,
} = require('./window')


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

const getPageUrl = (manga, ch, page) => new Promise((resolve, reject) => {
  const url_to_parse = `http://mangafox.me/manga/${mangaFox.fixTitle(manga)}/v01/c${mangaFox.pad(ch,3)}/${page}.html`;
  $.get(url_to_parse, d => {
    resolve(d.find('#viewer img').attr('src'))
  }, true)
})

const getFilename = n => `${n.toString().padStart(4, "0")}.jpg`



const getAllChapters = ({manga}) =>
  rss(`http://mangafox.la/rss/${manga}.xml`)
  .then(
    data => data.map(item => `http:${item.link}`)
  )


const range = n => Array.from(Array(n),(_,i)=>i)
const pad = n => {
  const pad = parseInt(n) === n ? 3 : 5
  return n.toString().padStart(pad, "0")
}

const getImages = ({manga, chapter, retry = 10}) => new Promise((resolve, reject) => {
  const reqLink = `http://m.mangafox.la/roll_manga/${manga}/v02/c${pad(chapter)}/1.html`
  // log("reqLink", reqLink)
  docCreator(reqLink)
    .then(doc => {
      const links = Array.from(doc.getElementsByClassName('reader-page'))
        .map(e => e.dataset.original)
      resolve(links)
    })
    .catch(err => reject(err))
})

// getImages({
//   manga: "blame",
//   chapter: 8.1,
// })


// const getImages = ({url, manga, chapter, retry = 10}) => new Promise((resolve, reject) => {
//   let urls;
//   let retries = 0
//   return docCreator(url).then(doc => {
//     const num = getPagesNumber(doc)
//     const urls = []
//     let n = 0;
//     const getUrls = () => {
//       docCreator(`http://mangafox.la/manga/${manga}/v01/c${pad(chapter)}/${n+1}.html`)
//         .then(doc => {
//           let url = doc.querySelector('#viewer img').src
//           urls.push(url)
//           if (n < num) {
//             n++
//             retries = 0
//             getUrls()
//           } else {
//             resolve(urls)
//           }
//         })
//         .catch(err => {
//           log(err, n)
//           if (retries < retry) {
//             retries++
//             getUrls()
//           } else {
//             reject("Max number of retries")
//           }
//         })
//     }
//     getUrls()
//   })
// })

const zipFolder = require('./zipFolder')
const progressiveBar = require('./progressiveBar')

module.exports = {
  progressiveBar,
  searchManga,
  getPageUrl,
  getImages,
  getFilename,
  getAllChapters,
  zipFolder,
  pad,
}