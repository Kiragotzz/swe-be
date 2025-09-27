'use strict';
import path from 'path';
import { readFile, access } from 'fs/promises';
import { fileURLToPath } from 'url';

import yargs from 'yargs'
import chalk from 'chalk'
//node cnabRows.js -f 0 -t 5 -s r -p 
//node cnabRows.js -f 0 -t 5 -s r -p F:\Projects

//HANDLER
async function handler(options) {
  const { from, to, segmento, pathFile, name } = options

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(pathFile ? pathFile+'/cnabExample.rem' : __filename);
  const file = path.resolve(`${__dirname}/cnabExample.rem`)
  const pathFileExists = await checkDirFileSync(file)
  if (!pathFileExists) return

  const cnabArray = await readFileSync(file)
  const cnabHeader = cnabArray.slice(0, 2)
  const cnabTail = sliceArrayPosition(cnabArray, -2)

  const line = findLinesSync(cnabArray, segmento.toUpperCase(), name)
  // console.log("🚀 ~ line:", line)

  log(messageLog(line, segmento.toUpperCase(), from, to, pathFile, __dirname))
}

//HELPERS FUNCTIONS
function checkDirFileSync(path) {
  return new Promise((resolve) => {
    access(path)
      .then(() => {
        console.log(`pathFile exists: ${chalk.bgGreen(true)}`)
        console.log(`pathFile: ${chalk.bgGreen(pathFile)}`)
        resolve(true)
      })
      .catch(error => {
        console.log(`pathFile does not exists: ${chalk.bgRed(false)}`)
        console.log(`pathFile: ${chalk.bgRed(pathFile)}`)
        resolve(false)
      })
  })
}

function readFileSync (file) {
  return new Promise((resolve)=>{
    readFile(file, 'utf8')
    .then(file => {
      resolve(file.split('\n'))
    })
    .catch(error => {
      resolve(false)
    })

  })
}

function findLinesSync(arr, segmento, name) {

  for (let i = 2; i < arr.length-2; i++) {

    if (arr[i][14] === segmento) {
      
    }

    // console.log('arr[i]: ',  arr[i])
    const lineArray = arr[i].split(' ').filter(e=>e)
    const segmentoLine = lineArray[0]
    if (segmentoLine[segmentoLine.length-1] === segmento) {
      return arr[i]
    }
    // console.log("🚀 ~ lineArray:", lineArray)
    if(i==6)return
  }
  return []
}

const optionsYargs = yargs(process.argv.slice(2))
  .usage('Uso: $0 [options]')
  .option("f", { alias: "from", describe: "posição inicial de pesquisa da linha do Cnab", type: "number", demandOption: true })
  .option("t", { alias: "to", describe: "posição final de pesquisa da linha do Cnab", type: "number", demandOption: true })
  .option("s", { alias: "segmento", describe: "tipo de segmento", type: "string", demandOption: true })
  .example('$0 -f 21 -t 34 -s p', 'lista a linha e campo que from e to do cnab')
  .option("p", { alias: "pathFile", describe: "define o path do Cnab a ser lido", type: "string" })
  .example('$0 -p ./cnabExample.rem', 'defiine o path em que se encontra o Cnab')
  .argv;

const { from, to, segmento, pathFile } = optionsYargs
handler(optionsYargs)

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(pathFile ? pathFile : __filename);
// const file = path.resolve(`${__dirname}/cnabExample.rem`)

const sliceArrayPosition = (arr, ...positions) => [...arr].slice(...positions)

const messageLog = (segmento, segmentoType, from, to, pathFile, __dirname) => `
  ----- Cnab linha ${segmentoType} -----

  ${pathFile != '' ? `caminho do arquivo: ${pathFile}` : `Caminho padrão será considerado: ${__dirname}`}

  posição from: ${chalk.inverse.bgBlack(from)}

  posição to: ${chalk.inverse.bgBlack(to)}

  item isolado: ${chalk.inverse.bgBlack(segmento.substring(from - 1, to))}

  item dentro da linha P: 
    ${segmento.substring(0, from)}${chalk.inverse.bgBlack(segmento.substring(from - 1, to))}${segmento.substring(to)}

  ----- FIM ------
`

const log = console.log

console.time('leitura Async')

// readFile(file, 'utf8')
  // .then(file => {
  //   const cnabArray = file.split('\n')

  //   const cnabHeader = sliceArrayPosition(cnabArray, 0, 2)

  //   const [cnabBodySegmentoP, cnabBodySegmentoQ, cnabBodySegmentoR, teste] = sliceArrayPosition(cnabArray, 2, -2)
  //   console.log("🚀 ~ cnabBodySegmentoR:", cnabBodySegmentoR)
  //   console.log("🚀 ~ cnabBodySegmentoQ:", cnabBodySegmentoQ)
  //   console.log("🚀 ~ cnabBodySegmentoP:", cnabBodySegmentoP)
  //   console.log("🚀 ~ teste:", teste)

  //   const cnabTail = sliceArrayPosition(cnabArray, -2)

  //   if (segmento === 'p') {
  //     log(messageLog(cnabBodySegmentoP, 'P', from, to, pathFile))
  //     return
  //   }

  //   if (segmento === 'q') {
  //     log(messageLog(cnabBodySegmentoQ, 'Q', from, to, pathFile))
  //     return
  //   }

  //   if (segmento === 'r') {
  //     log(messageLog(cnabBodySegmentoR, 'R', from, to, pathFile))
  //     return
  //   }

  //   // log(messageLog())

  // })
  // .catch(error => {
  //   console.log("🚀 ~ file: cnabRows.js ~ line 76 ~ error", error)
  // })
console.timeEnd('leitura Async')
