const fs = require('fs')
const unzipper = require('unzipper')
const { write, position, find } = require('promise-path')
const rootpath = position(__dirname, '../')
const report = (...messages) => console.log('[Unzip Photos]', ...messages)

async function unzipPhotos (filename) {
  report('Unzip operation starting')
  await findPhotos()

  const filepath = rootpath(filename)
  await fs.createReadStream(filepath)
    .pipe(unzipper.Extract({ path: rootpath('photos') }))
    .promise()

  report('Unzip operation complete')
  return findPhotos()
}

async function findPhotos() {
  const photos = await find(rootpath('photos/*.jpg'))
  report('Found', photos.length, 'photos')
  return photos
}

async function start () {
  return unzipPhotos('Kitty Diary Photos.zip')
}

module.exports = start
