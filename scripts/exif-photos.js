const { ExifImage } = require('exif')
const { find, write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[EXIF Photos]', ...messages)

async function getPhotoMetaData(path) {
  return new Promise((resolve, reject) => {
    try {
      new ExifImage({
        image: path
      }, function(error, exifData) {
        if (error)
          report('Error: ' + error.message);
        else
          resolve({
            image: path,
            exifData
          })
      })
    } catch (error) {
      report('Error: ' + error.message);
      resolve({
        image: path,
        exifData
      })
    }
  })
}

function parseDate(s) {
  const b = s.split(/\D/);
  return new Date(b[0],b[1]-1,b[2],b[3],b[4],b[5])
}

function reduceMetaData(data) {
  const dateString = data.exifData.exif.DateTimeOriginal
  const date = parseDate(dateString)
  return {
    image: data.image,
    date
  }
}

async function start() {
  try {
    const photos = await find('photos/*.jpg')
    // report('Photos', photos)
    const photoMetaData = await Promise.all(photos.map(getPhotoMetaData))

    const photoFeed = photoMetaData.map(reduceMetaData)
    const filename = 'photo-feed.json'
    report('Writing photo feed to:', filename)
    await write(datapath(filename), JSON.stringify(photoFeed, null, 2), 'utf8')
  }
  catch (ex) {
    report('Error', ex)
  }
}

module.exports = start
