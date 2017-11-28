# mfox-dl

A cli utility for download manga from mangafox

## Instalation
  ```bash
  npm install -g mfox
  ```

## usage

`mfox-dl [options] [command]`


### Options:

-V, --version  output the version number

-h, --help     output usage information

### Commands:

#### Get the number of chapters of a manga:

```
mfox-dl chapters <manga>
```

e.g.

```
mfox-dl chapters toriko
```

#### Download a manga chapter:
```
mfox-dl down <manga> [chapter]
```
e.g. 
```
mfox-dl down toriko 29
```

#### Download a manga page:

```
mfox-dl down <manga> [chapter]
```
e.g. 
```
mfox-dl down gantz 10 4
```

#### Download a range of chapters:

```
mfox-dl down <manga> -r <a>..<b>
```

```
mfox-dl down gantz -r 20..37
```

Note:
All the manga name must be the encountered in the link from mangafox
i.e http://mangafox.me/manga/onepunch_man/ -> onepunch_man

## Programatic usage

### install
```
npm install mfox --save
```
or
```
yarn add mfox
```

### require

```javascript
const {
  downloadChapter,
  multiDownload,
  downloadPage
} = require('mfox')

// Download multiple mangas
multiDownload({
  manga: 'gantz',
  from: 112,
  to: 145,
})

downloadChapter("sun_ken_rock", 35).run()
  .then(_ => console.log("Done!"))

downloadPage("sun_ken_rock", 4, 10)
```

If you find a Bug and want to contribute send a PR or post an issue.




------------------------------------------------------------------
"THE PIZZA-WARE LICENSE" (Revision 42):
Peter Hofmann <pcode@uninformativ.de> wrote these files. As long as you
retain this notice you can do whatever you want with this stuff. If we
meet some day, and you think this stuff is worth it, you can buy me a
pizza in return.
------------------------------------------------------------------