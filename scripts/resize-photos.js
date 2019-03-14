const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { write, position, find, make } = require('promise-path')
const photopath = position(__dirname, '../photos')
const buildpath = position(__dirname, '../build')
const report = (...messages) => console.log('[Resize Photos]', ...messages)

async function resizePhotos (photolist) {
  const resizingWork = photolist.map(resizePhoto)
  await Promise.all(resizingWork)
  report('Resized', resizingWork.length, 'photos')
}

async function resizePhoto(filepath) {
  const filename = path.basename(filepath)
  const outpath = buildpath(`photos/${filename}`)
  report('Resizing photo:', filename)
  return sharp(filepath)
    .resize(1024)
    .toFile(outpath)
}

async function findPhotos() {
  const photos = await find(photopath('*.jpg'))
  report('Found', photos.length, 'photos')
  return photos
}

async function start () {
  await make(buildpath('/photos'))
  const photolist = await findPhotos()
  return resizePhotos(photolist)
}

module.exports = start
