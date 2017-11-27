// @ts-check
const Rx = require('@reactivex/rxjs')

const fs = require('fs')
// const request = require('request')
const request = require('requestretry')
const progress = require('request-progress')
const {inspect} = require('util')
const chalk = require('chalk')
const log = console.log
const Listr = require('listr')
const mangaFox = require('node-mangafox')
const prettyBytes = require('pretty-bytes')
const logSymbols = require('log-symbols')
const {
  progressiveBar,
  getPageUrl,
  getFilename,
  searchManga
} = require('./utils')
// const Multiprogress = require("multi-progress")
// const puppeteer = require('puppeteer')
// const multi = new Multiprogress(process.stderr)

process.title = "mangafox-dl"

const dlPage = (url, page, filename, chapterName) => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0',
    'Referer': "",
  }
  return new Rx.Observable(observer => {
    progress(
      request({
        url,
        headers,
        maxAttempts: 15,
        retryDelay: 5000,
      }, (error, res, body) => {
        if (res) {
          observer.next(`Retry ${res.attempts}...`)
        }
        if (error) {
          throw new Error(error)
        }
      })
    )
      .on('response', res => {
        if (res.statusCode === 200) {
          observer.next("Starting...")
        } else {
          throw new Error("Status code" + res.statusCode)
        }
        //  "[:bar] :percent :etas | :current of :total bytes"
      })
      .on('progress', ({percent, size}) => {
        observer.next(`${progressiveBar({title: "Downloading", value: percent})} ${prettyBytes(size.transferred)}/${prettyBytes(size.total)}`)
      })
      .on('error', err => {
        log(logSymbols, err)
        observer.complete()
      })
      .on('end', () => {
        observer.complete()
      })
      .pipe(fs.createWriteStream(`${__dirname}/${chapterName}/${filename}`))
  })
}

const downloadChapter = (manga, ch) => {
  // Array to store urls
  let images = []

  // create the folder
  const chapterName = `${manga}-${ch.toString().padStart(3, "0")}`
  if (!fs.existsSync(chapterName)) {
    fs.mkdirSync(chapterName)
  }

  const listrTask = new Listr([
    {
      title: chalk.blue.bold(`Getting imgUrls of ${manga} chapter ${ch}`),
      task: () => new Promise((resolve, reject) => {
        mangaFox.getImages(manga, ch, (urls) => {
          images = urls
          resolve()
        })
      })
    },
    {
      title: chalk.blue.bold("Downloading manga"),
      task: () => new Listr(images.map((url, page) => ({
        title: chalk.white.bold(getFilename(page + 1)),
        task: () => dlPage(url, page + 1, getFilename(page + 1), chapterName),
      })), {concurrent: true})
    }
  ])
  return listrTask
}

const multiDownload = ({manga, from, to}) => {
  downloadChapter(manga, from)
    .run()
    .then(() => {
      if (from < to) {
        multiDownload({
          from: from + 1,
          manga,
          to,
        })
      }
    })
    .catch(err => log(logSymbols.error, err))
}

const downloadPage = (manga, ch, page) => {
  const chapterName = `${manga}-${ch.toString().padStart(3, "0")}`
  log("Getting info");
  getPageUrl(manga, ch, page)
    .then(url => {
      dlPage(url, page, getFilename(page), chapterName).subscribe(
        data => log(data),
        error => log(error),
        () => log("Done!")
      )
    })
}

// downloadChapter("sun_ken_rock", 61)
//   .run()

// multiDownload({
//   manga: "gantz",
//   from: 129,
//   to: 200
// })

downloadPage("gantz", 173, 9)

// mangaFox.getDetails(35, data => log(data))
// searchManga("gan")
// gantz , 35