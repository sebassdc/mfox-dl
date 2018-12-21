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
const gradient = require('gradient-string')
const webp = require('webp-converter')

const dinfo = chalk.green.italic.bold
const { white } = chalk
const {
  progressiveBar,
  getPageUrl,
  getImages,
  getFilename,
  searchManga,
  zipFolder,
  getAllChapters,
  pad
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
      })
    )
      .on('response', res => {
        if (res.statusCode === 200) {
          observer.next("Starting...")
        }
        //  "[:bar] :percent :etas | :current of :total bytes"
      })
      .on('progress', ({percent, size}) => {
        observer.next(`${progressiveBar({title: "Downloading", value: percent})} ${prettyBytes(size.transferred||0)}/${prettyBytes(size.total||0)}`)
      })
      .on('error', err => {
        log(logSymbols.error, err)
        observer.complete()
      })
      .on('end', () => {
        observer.complete()
      })
      .pipe(fs.createWriteStream(`${chapterName}/${filename}`))
      .on('error', err => {
        throw new Error(`Pipe Error: ${err}`)
      })
  })
}

const compress = (input, ouput) => new Promise((resolve, reject) => {
  webp.cwebp(input, ouput, '-quiet -q 50', status => {
    if (status === '101') reject(status)
    else resolve(status)
  })
})

const remove = filename => new Promise((resolve, reject) => {
  fs.unlink(filename, (err) => {
    if (err) reject(err)
    resolve()
  })
})

const downloadChapter = (manga, ch, volume, url = null) => {
  // Array to store urls
  let images = []

  // create the folder
  const chapterName = `${manga}-${ch.toString().padStart(3, "0")}`
  if (!fs.existsSync(chapterName)) {
    fs.mkdirSync(chapterName)
  }

  const listrTask = new Listr([
    {
      title: chalk.whiteBright(`Get imgUrls of ${dinfo(manga)} chapter ${dinfo(ch)}`),
      task: () => new Promise((resolve, reject) => {
        getImages({
          manga,
          chapter: ch,
          volume
        }).then( urls => {
          images = urls
          resolve()
        })
      })
    },
    {
      title: chalk.whiteBright("Download images"),
      task: () => new Listr(images.map((url, page) => ({
        title: chalk.whiteBright(getFilename(page + 1)),
        task: () => dlPage(url, page + 1, getFilename(page + 1), chapterName),
      })), {concurrent: true, exitOnError: true})
    // },{
    //   title: chalk.whiteBright("Compress to webp"),
    //   task: () => new Listr(images.map((_, page) => ({
    //     title: `compressing ${(page + 1).toString().padStart(4, '0')}.jpg`,
    //     task: () => compress(
    //       `${chapterName}/${(page + 1).toString().padStart(4, '0')}.jpg`,
    //       `${chapterName}/${(page + 1).toString().padStart(4, '0')}.webp`,
    //     )
    //   })), {concurrent: false, exitOnError: true})
    // },{
    //   title: chalk.whiteBright("Remove jpg"),
    //   task: () => new Listr(images.map((_, page) => ({
    //     title: `removing ${(page + 1).toString().padStart(4, '0')}.jpg`,
    //     task: () => remove(
    //       `${chapterName}/${(page + 1).toString().padStart(4, '0')}.jpg`,
    //     )
    //   })), {concurrent: false, exitOnError: true})
    },{
      title: chalk.whiteBright("Zipping chapter"),
      task: () => {
        zipFolder(chapterName)
          .catch(err => log(`${logSymbols} ${err}`))
      },
    },
  ])
  return listrTask
}

const multiDownload = ({manga, from, volume, to, links = null}) => {
  downloadChapter(manga, from, volume, links ? links.shift() : null)
    .run().then(() => {
      if (from < to) {
        multiDownload({manga, from: from + 1, to, links, volume})
      }
      else {
        return
      }
    }).then(()=> log(gradient.rainbow("---Downloaded!---")))
}

const downloadPage = (manga, ch, page) => {
  const chapterName = `${manga}-${pad(ch)}`
  let url
  const tasks = new Listr([
    {
      title: white('Get img url'),
      task: () => getPageUrl(manga, ch, page).then(uri => {
        url = uri
      })
    },
    {
      title: white(`Downloading ${dinfo(manga)} chapter ${dinfo(ch)} page ${dinfo(page)}`),
      task: () => dlPage(url, page, getFilename(page), chapterName)
    }
  ])
  tasks.run().then(_ => log(gradient.rainbow("---Downloaded!---")))
}

const downloadAll = ({manga}) => {
  mangaFox.getChapters(manga, n => {
    multiDownload({manga, from: 1, to: Number(n)})
  })
}

module.exports = {
  dlPage,
  downloadChapter,
  downloadPage,
  multiDownload,
  downloadAll,
}


// downloadPage("gantz", 174, 1)

// mangaFox.getDetails(35, data => log(data))
// searchManga("gan")
// gantz , id:35