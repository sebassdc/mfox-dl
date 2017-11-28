// @ts-check
const Rx = require('@reactivex/rxjs')
const fs = require('fs')
const request = require('requestretry')
const progress = require('request-progress')
const chalk = require('chalk')
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

const log = console.log

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
        if (error) {
          if (res) observer.next(`Retry ${res.attempts}...`)
          if (res.attempts >= 15) {
            throw new Error("Maximun number of attempts on")
          }
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
      .pipe(fs.createWriteStream(`${chapterName}/${filename}`))
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
      title: chalk.whiteBright(`Get imgUrls of ${chalk.blue.bold(manga)} chapter ${chalk.blue.bold(ch)}`),
      task: () => new Promise((resolve, reject) => {
        mangaFox.getImages(manga, ch, (urls) => {
          images = urls
          resolve()
        })
      })
    },
    {
      title: chalk.whiteBright.bold("Download images"),
      task: () => new Listr(images.map((url, page) => ({
        title: chalk.whiteBright.bold(getFilename(page + 1)),
        task: () => dlPage(url, page + 1, getFilename(page + 1), chapterName),
      })), {concurrent: true, exitOnError: false})
    }
  ])
  return listrTask
}

const multiDownload = ({manga, from, to}) => {
  let tasks = Array(to + 1 - from).fill(0).map((_, i) => ({
    title: chalk.yellow.bold(`Downloading ${manga} ${from + i}`),
    task: () => downloadChapter(manga, from + i),
  }))
  const listr = new Listr(tasks, {exitOnError: false})
  listr.run().then(()=> log("Done!"))
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

module.exports = {
  dlPage,
  downloadChapter,
  downloadPage,
  multiDownload
}


// downloadPage("gantz", 174, 1)

// mangaFox.getDetails(35, data => log(data))
// searchManga("gan")
// gantz , id:35