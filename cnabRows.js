'use strict';
import path from 'path';
import { readFile, access } from 'fs/promises';
import { fileURLToPath } from 'url';

import yargs from 'yargs'
import chalk from 'chalk'

//PESQUISA COM NOME DA EMPRESA
//node cnabRows.js -f 34 -t 73 -s p -e NTT -p F:\Projects

//PESQUISA SEM NOME DA EMPRESA RETORNA NOME DAS EMPRESAS QUE TIVERAM A OPERACAO PESQUISADA
// node cnabRows.js -f 34 -t 73 -s q -p F:\Projects

const SEGMENTOIDX = 13
const NOMEEMPRESAINICIO = 33
const NOMEEMPRESAFIM = 73

//HANDLER MAIN
async function handler(options) {
  const { from, to, segmento, pathFile, empresa } = options

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(pathFile ? pathFile + '/cnabExample.rem' : __filename);
  const file = path.resolve(`${__dirname}/cnabExample.rem`)
  const pathFileExists = await checkDirFileSync(file)
  if (!pathFileExists) return
  console.time('leitura Async')

  const cnabArray = await readFileSync(file)
  const cnabHeader = cnabArray.slice(0, 2)
  const cnabTail = cnabArray.slice(-2)

  const resFind = findLinesSync(cnabArray, segmento, empresa)
  console.log("EMPRESAS QTD: ", resFind.empresas.length)
  console.log("LINHAS QTD: ", resFind.lines.length)

  console.log(messageLog(resFind.lines, resFind.empresas, segmento.toUpperCase(), from, to, pathFile, __dirname))
  console.timeEnd('leitura Async')
}

//HELPERS
function checkDirFileSync(path) {
  return new Promise((resolve) => {
    access(path)
      .then(() => {
        console.log(`pathFile exists: ${chalk.bgGreen(true)}`)
        console.log(`pathFile: ${chalk.bgGreen(path)}`)
        resolve(true)
      })
      .catch(error => {
        console.log(`pathFile does not exists: ${chalk.bgRed(false)}`)
        console.log(`pathFile: ${chalk.bgRed(path)}`)
        resolve(false)
      })
  })
}

function readFileSync(file) {
  return new Promise((resolve) => {
    readFile(file, 'utf8')
      .then(file => {
        resolve(file.split('\n'))
      })
      .catch(error => {
        resolve(false)
      })

  })
}

function findLinesSync(arr, segmento, empresa) {
  console.log("🚀 ~ arr.length: ", arr.length)
  segmento = segmento.toUpperCase()
  let lines = []
  let hashSegmentoEmpresa = {}

  for (let i = 2; i < arr.length - 2; i++) {
    let mapIdxSegmentosEmpresa = {
      'P': 1,
      'Q': 0,
      'R': -1,
    }
    const nomeCompletoEmpresa = arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + i].slice(NOMEEMPRESAINICIO, NOMEEMPRESAFIM)

    if (!empresa && arr[i][SEGMENTOIDX] === segmento) {//SEGMENTO Q DO QUAL FOI PESQUISADO
      if (!hashSegmentoEmpresa[nomeCompletoEmpresa]) {
        hashSegmentoEmpresa[nomeCompletoEmpresa] = { empresa: nomeCompletoEmpresa, linha: i, colunaInicial: NOMEEMPRESAINICIO, colunaFinal: NOMEEMPRESAFIM, segmento: arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + i][SEGMENTOIDX] }
      }
      lines.push(arr[i])
    } else if (empresa && arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + i].slice(NOMEEMPRESAINICIO, NOMEEMPRESAFIM).includes(empresa)) {
      if (!hashSegmentoEmpresa[nomeCompletoEmpresa]) {
        hashSegmentoEmpresa[nomeCompletoEmpresa] = { empresa: nomeCompletoEmpresa, linha: i, colunaInicial: NOMEEMPRESAINICIO, colunaFinal: NOMEEMPRESAFIM, segmento: arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + i][SEGMENTOIDX] }
      }
      lines.push(arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + i - (1)])//P
      lines.push(arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + i])//Q
      if (arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + (i + 1)][SEGMENTOIDX] == 'R') {//R APENAS SE EXISTIR POIS E OPCIONAL
        i += 2
        lines.push(arr[mapIdxSegmentosEmpresa[arr[i][SEGMENTOIDX]] + (i + 1)])
      } else {
        i += 1
      }
    }
  }
  // console.log('hashSegmentoEmpresa: ', hashSegmentoEmpresa)
  return { lines, empresas: Object.values(hashSegmentoEmpresa) }

}

const messageLog = (segmentos, empresas, segmentoType, from, to, pathFile, __dirname) => `
  ----- Cnab linha ${segmentoType} -----

  ${pathFile != '' ? `caminho do arquivo: ${pathFile}` : `Caminho padrão será considerado: ${__dirname}`}

  posição from: ${chalk.inverse.bgBlack(from)}

  posição to: ${chalk.inverse.bgBlack(to)}

  Empresas encontradas no CNAB:
   ${
      empresas.map(e=>e.empresa).join('\n   ')
    }

  Linhas encontradas no CNAB: 
    ${
      segmentos.map(segmento=>
        `
          ${segmento.substring(0, from - 1)}${chalk.inverse.bgBlack(segmento.substring(from - 1, to))}${segmento.substring(to)}
        `
        ).join('\n   ')
      }

  ----- FIM ------
`

const optionsYargs = yargs(process.argv.slice(2))
  .usage('Uso: $0 [options]')
  .option("f", { alias: "from", describe: "posição inicial de pesquisa da linha do Cnab", type: "number", demandOption: true })
  .option("t", { alias: "to", describe: "posição final de pesquisa da linha do Cnab", type: "number", demandOption: true })
  .option("s", { alias: "segmento", describe: "tipo de segmento", type: "string", demandOption: true })
  .example('$0 -f 21 -t 34 -s p', 'lista a linha e campo que from e to do cnab')
  .option("p", { alias: "pathFile", describe: "define o path do Cnab a ser lido", type: "string" })
  .option("e", { alias: "empresa", describe: "procura os registros pelo nome da empresa", type: "string" })
  .example('$0 -p ./cnabExample.rem', 'defiine o path em que se encontra o Cnab')
  .argv;

handler(optionsYargs)
