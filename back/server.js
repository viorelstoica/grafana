import express from 'express'
import cors from 'cors'
import es from 'event-stream'
import fs from 'fs'
import e from 'express'

const port = process.env.PORT || 3000
const baseDataFolder = process.env.BASE_DATA_FOLDER || "../../data"
const app = express()

var myLogger = function (req, res, next) {
    const { url, path: routePath } = req
    console.log(req)
    next()
}
app.use(myLogger)
app.use(cors())
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

//*************************************************************

app.get('/', (req, res) => {
    res.send('monitoring backend')
})

app.get('/dates', (req, res) => {
    let ret = []
    let dates = fs.readdirSync(`${baseDataFolder}/`).filter(file => fs.statSync(`${baseDataFolder}/${file}`).isDirectory).sort((a, b) => -a.localeCompare(b)).filter(v => v.startsWith("20"))
    dates.forEach(date => {
        fs.readdirSync(`${baseDataFolder}/${date}/trace`).filter(dir => fs.statSync(`${baseDataFolder}/${date}/trace/${dir}`).isDirectory).forEach(dir => {
            ret.push({ date: date, dir: dir, cnt: fs.readdirSync(`${baseDataFolder}/${date}/trace/${dir}`).filter(f => f.endsWith('.xml')).length })
        })
    })
    res.send(ret)
})

app.get('/tti/:day/messages', (req, res) => {
    const day = req.params.day
    let ret = []
    fs.readdirSync(`${baseDataFolder}/${day}/trace`).filter(dir => fs.statSync(`${baseDataFolder}/${day}/trace/${dir}`).isDirectory).forEach(dir => {
        let files = fs.readdirSync(`${baseDataFolder}/${day}/trace/${dir}`).filter(f => f.endsWith('.xml') && !f.includes('F2B'))
        files.forEach(file => {
            const tokens = file.split('_')
            let time = tokens[0].slice(0, 4) + "-" + tokens[0].slice(4, 6) + "-" + tokens[0].slice(6, 8) + ' ' + tokens[1].slice(0, 2) + ":" + tokens[1].slice(2, 3) + "0:00"
            let categ = tokens[4]
            let elm = ret.find(r => r.Time === time)
            if (!elm) {
                switch (categ) {
                    case 'msgin':
                        ret.push({ Time: time, msgin: 1, postfilter: 0, postmap: 0, msgout: 0 })
                        break
                    case 'msgout':
                        ret.push({ Time: time, msgin: 0, postfilter: 0, postmap: 0, msgout: 1 })
                        break
                    case 'postfilter':
                        ret.push({ Time: time, msgin: 0, postfilter: 1, postmap: 0, msgout: 0 })
                        break
                    case 'postmap':
                        ret.push({ Time: time, msgin: 0, postfilter: 0, postmap: 1, msgout: 0 })
                        break
                }
            }
            else {
                elm[categ]++
            }
        })
    })
    res.send(ret)
})





