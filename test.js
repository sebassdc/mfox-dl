// @ts-check
const mangaFox = require('node-mangafox')


const log = str => console.log(str)
// mangaFox.getImages("toriko", 361, urls => {
//   urls.forEach(e => log(e));
// })
  
mangaFox.getChapters("gantz", log)



// getPageUrl("sun_ken_rock", 42, 28)
// const getChapter = baseUrl => baseUrl.substring(baseUrl.lastIndexOf('/') + 1)


// const dlPage = (manga, ch, page, filename, chapterName) => {
//   const headers = {
//     'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0',
//     'Referer': "",
//   }
  
//   return new Rx.Observable(observer => {
//     getPageUrl(manga, ch, page)
//       .then((url) => {
//         progress(
//           request({
//             url,
//             headers,
//             maxAttempts: 15,
//             retryDelay: 5000,
//           }, (error, res, body) => {
//             if (error) {
//               observer.next(`Retry ${res.attempts}...`)
//             }
//           })
//         )
//           .on('response', res => {
//             if (res.statusCode === 200)
//             observer.next("Starting...")
//             //  "[:bar] :percent :etas | :current of :total bytes"
//           })
//           .on('progress', ({percent, size}) => {
//             observer.next(`Downloading [${progressBar({overallPercent: percent,})}] ${Math.floor(percent * 100)}% ${prettyBytes(size.transferred)}/${prettyBytes(size.total)}`)
//           })
//           .on('error', err => {
//             log(logSymbols.error, err)
//             observer.complete()
//           })
//           .on('end', () => {
//             observer.complete()
//           })
//           .pipe(fs.createWriteStream(`${__dirname}/${chapterName}/${filename}`))  
//       })
//   })
// }

// const downloadChapter = (manga, ch) => {
//   // Number of pages
//   let pageNumber = 0;

//   // create the folder
//   const chapterName = `${manga}-${ch.toString().padStart(3, "0")}`
//   if (!fs.existsSync(chapterName)) {
//     fs.mkdirSync(chapterName)
//   }
  
//   const listrTask = new Listr([
//     {
//       title: chalk.blue.bold(`Getting ${manga} chapter ${ch} info...`),
//       task: () => new Promise((resolve, reject) => {
//         mangaFox.getPages(manga, ch, n => {
//           pageNumber = n;
//           resolve(n)
//         })
//       })
//     },
//     {
//       title: chalk.blue.bold("Downloading manga"),
//       task: () => {
//         const dummie = Array(pageNumber).fill(0)
//         const tasks = dummie.map((_, page) => ({
//           title: chalk.white.bold(getFilename(page + 1)),
//           task: () => dlPage(manga, ch, page + 1, getFilename(page + 1), chapterName),
//         }))
//         return new Listr(tasks, {concurrent: true})
//       }
//     }
//   ])
//   return listrTask
// }