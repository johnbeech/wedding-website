const path = require('path')
const { read, write, clean, position, find } = require('promise-path')
const handlebars = require('handlebars')

const datapath = position(__dirname, '../data')
const templatepath = position(__dirname, '../templates')
const buildpath = position(__dirname, '../build')
const report = (...messages) => console.log('[Build Website]', ...messages)

async function processTemplates (files, data) {
  const templateWork = files.map(filePath => processTemplate(filePath, data))
  return Promise.all(templateWork)
}

async function processTemplate(filePath, data) {
  const templateString = await read(filePath, 'utf8')
  const template = handlebars.compile(templateString)
  const outputString = template(data)

  const templatePathBase = templatepath('./')
  const fragmentPath = filePath.substring(templatePathBase.length)
  const fragmentBasePath = path.dirname(fragmentPath)
  const outFilePath = buildpath(fragmentPath)

  report('Writing template:', fragmentPath, outputString.length, 'bytes')
  return write(outFilePath, outputString, 'utf8')
}

async function copyStaticFiles(files) {
  const staticFileWork = files.map(copyStaticFile)
  return Promise.all(staticFileWork)
}

async function copyStaticFile(filePath) {
  const staticFile = await read(filePath)
  const fileBasePath = templatepath('./')
  const fragmentPath = filePath.substring(fileBasePath.length)
  const fragmentBasePath = path.dirname(fragmentPath)
  const outFilePath = buildpath(fragmentPath)

  report('Copying file:', fragmentPath, staticFile.length, 'bytes')
  return write(outFilePath, staticFile)
}

async function findTemplateFiles() {
  const files = await find(templatepath('**/*.*'))
  return files.filter(n => /(css|html|js)/.test(n))
}

async function findStaticFiles() {
  const files = await find(templatepath('**/*.*'))
  return files.filter(n => !/(css|html|js)/.test(n))
}

async function readJson(file) {
  const fileContents = await read(datapath(file), 'utf8')
  return JSON.parse(fileContents)
}

async function start () {
  const templateFiles = await findTemplateFiles()
  const staticFiles = await findStaticFiles()

  const feed = await readJson('wedding-data.json')

  await clean(buildpath('css'))
  await clean(buildpath('images'))
  await clean(buildpath('index.html'))
  await processTemplates(templateFiles, feed)
  await copyStaticFiles(staticFiles)
  return true
}

module.exports = start
