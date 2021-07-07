const express = require('express');
const app = express();
const fs = require('fs');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const path = require('path');
const mv = require('mv');
const fileList = require('./fileList.json');
const { features } = require('process');
// const promisify = require('util').promisify
// const readFile = promisify(fs.readFile)

app.use(express.static("assets"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());

// let caches = {};
var db = [];
//callect file data back to database array after reload;
let collectData = fs.readdirSync('./existingFiles');
for (let exfile of collectData) {
    const size = fs.statSync('./existingFiles/' + exfile).size;
    db.push({ name: exfile, size });
}


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.post('/upload', (req, res) => {
    console.log(req.files);
    if (req.files) {
        let uploadedFile = req.files.file;
        let fileName = uploadedFile.name;

        // let fileData = uploadedFile.data;
        uploadedFile.mv('./existingFiles/' + fileName, function(err) {
            if (err) {
                console.error(err);
            }
            console.log('done moving file')
        })

        // db info for update existing file table
        let files = {
            name: uploadedFile.name,
            size: uploadedFile.size,
        }
        db.push(files);
        console.log("db printing", db)
        let jsonString = JSON.stringify(db, null, 2);
        console.log("jonsString printing", jsonString)
        fs.writeFile('./fileList.json', jsonString, err => {
            if (err) {
                console.log('Error writing file ', err);
            } else {
                console.log('done writing into json')
            }
        })
        res.redirect('/');
    } else {
        return 'no file is uploading';
    }
})

app.get('/fileList.json', (req, res) => {
    res.sendFile(__dirname + '/fileList.json', function(err) {
        if (err) {
            console.error(err);
        } else {
            console.log('Sent json');
        }
    });
});

app.get('/download/:filename', (req, res) => {
    res.download(__dirname + "/existingFiles/" + req.params.filename);
});

app.post('/remove', (req, res) => {
    console.log(req.body);
    let idlist = req.body['idlist[]']
    console.log('idlist', idlist);
    let origindata = fs.readFileSync('./fileList.json');
    let json = JSON.parse(origindata);


    if (typeof idlist == 'array' || typeof idlist == 'object') {
        idlist.forEach(file => {
            console.log('each idlist', file);
            json = json.filter((files) => { return files.name !== file });
            console.log("json in array delete", json)
            db = json;
            console.log("db in array delete", db)
            fs.unlink(__dirname + "/existingFiles/" + file, (err) => {
                if (err) console.error(err);
                console.log('file has deleted')
            });
        })
    } else {
        json = json.filter((file) => { return file.name !== idlist });
        console.log("json in single delete", json)
        db = json;
        console.log("db in single delete", db)
        fs.unlink(__dirname + "/existingFiles/" + idlist, (err) => {
            if (err) console.error(err);
            console.log('file has deleted');
        });
    }

    fs.writeFileSync('./fileList.json', JSON.stringify(json, null, 2));

    res.send();
});



app.listen(1227, () => {
    console.log("server is running with port 1227")
})