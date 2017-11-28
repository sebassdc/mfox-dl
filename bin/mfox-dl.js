#! /usr/bin/env node
const { log } = console
const { inspect } = require('util')
const logSymbols = require('log-symbols')
const program = require('commander')
const { downloadChapter } = require('../')
const mangaFox = require('node-mangafox')
const chalk = require('chalk')
const gradient = require('gradient-string')


const range = (val) => val.split('..').map(Number)


program
  .version('0.1.0')

// 'Search for mangas likely the query'
// program
//   .command('search <query>')

 // 'Get info of a manga given an id'
// program
//   .command('info <id>')

// 'Get the number of chapters of the manga'
program
  .command('chapters <manga>')
  .description('Get the number of chapters of the manga')
  .action(manga => {
    mangaFox.getChapters("gantz", num => {
      log(`${chalk.white.bold(Manga)} have ${chalk.white.bold(num)} chapters`)
    })
  })


program
  .command('down <manga> [chapter]')
  .description('Download a manga chapter or a range of chapters')
  .option('-r, --range <a>..<b>', 'Download from chapter <a> to chapter <b>', range)
  .action((manga, chapter, opt) => {

    if (opt.range) {
      multiDownload({
        manga,
        from: opt.range[0],
        to: opt.range[1],
      })
      return;
    } else if(chapter) {
      downloadChapter(manga, chapter)
        .run()
        .then(() => {
          log(gradient.rainbow("---Downloaded!---"))
        })
    } else {
      log(` ${logSymbols.info} TODO: Download all feature`)
    }
  })



program
  .parse(process.argv)

