const fs = require('node:fs')
const path = require('node:path')

const [, , filePath, DecryptPath] = process.argv
// const filePath = './Encrypt/美乐家清单.xlsx'
// const DecryptPath = './Decrypt/美乐家清单.xlsx'
const readStream = fs.createReadStream(filePath)
const fileName = path.basename(filePath)
const outPutPath = path.join(DecryptPath, fileName)
const writeStream = fs.createWriteStream(outPutPath)
readStream.pipe(writeStream)
writeStream.on('finish', () => {
  console.log(true)
})

// 监听 'error' 事件以捕获并处理任何在读取或写入过程中发生的错误
readStream.on('error', (err) => {
  console.log(err.message)
})

writeStream.on('error', (err) => {
  console.log(err.message)
})
