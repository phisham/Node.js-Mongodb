const fs = require('fs');
const multer = require('multer');
const express = require('express');
var PORT=process.env.PORT || 5000;
const bodyParser=require("body-parser");
const { ifError } = require("assert");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));

let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/";

var mongoose =require('mongoose');
mongoose.connect('mongodb://localhost:27017/kalpas_project',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
});

const csv=require('csvtojson');
const { Cursor, MongoInvalidArgumentError } = require('mongodb');

 

 
global.__basedir = __dirname;


// -> Multer Upload Storage
const storage = multer.diskStorage({
 destination: (req, file, cb) => {
    cb(null, __basedir + '/uploads/')
 },
 filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
 }
});
 
const upload = multer({storage: storage});
 
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
})
// -> Express Upload RestAPIs
app.post('/uploadfile', upload.single("uploadfile"), (req, res) =>{
    importCsvData2MongoDB(__basedir + '/uploads/' + req.file.filename);
    res.json({
        'msg': 'File uploaded/import successfully!', 'file': req.file
    });
});
 
// -> Import CSV File to MongoDB database
function importCsvData2MongoDB(filePath){
    csv()
        .fromFile(filePath)
        .then((jsonObj)=>{
            console.log(jsonObj);
            
            
            
            
            
            /**
             [ 
                { _id: '1', name: 'Jack Smith', address: 'Massachusetts', age: '23' },
                { _id: '2', name: 'Adam Johnson', address: 'New York', age: '27' },
                { _id: '3', name: 'Katherin Carter', address: 'Washington DC', age: '26' },
                { _id: '4', name: 'Jack London', address: 'Nevada', age: '33' },
                { _id: '5', name: 'Jason Bourne', address: 'California', age: '36' } 
             ]
            */
            // Insert Json-Object to MongoDB
            
            MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
                if (err) throw err;
                let dbo = db.db("kalpas_project");
                 dbo.collection("services").insertMany(jsonObj, (err, res) => {
                   if (err) throw err;
                   console.log("Number of documents inserted: " + res.insertedCount);
                   /**
                       Number of documents inserted: 5
                   **/
                   db.close();
                });
            });
            
            fs.unlinkSync(filePath);
        })
}
app.post('/read',(req,res)=>{
    
    MongoClient.connect(url, (err, db) => {
                if (err) throw err;
                let dbo = db.db("kalpas_project");
                dbo.collection("services").findOne({}, function(err, result) {
                    if (err) throw err;
                    res.json(result.name+','+result.address+','+result.age);
                    db.close();
                });
    });
                
    
    
})
app.post('/update',(req,res)=>{
   
    MongoClient.connect(url, (err, db) => {
                if (err) throw err;
                let dbo = db.db("kalpas_project");
                
                
                var myquery = { address: "Canyon 123"};
                var newvalues = { $set: {name: "Mick", address: "Canyon",age:"30" } };
                dbo.collection("services").updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                    db.close();
                });
    })
    
})
app.post('/delete',(req,res)=>{
    MongoClient.connect(url, (err, db) => {
                if (err) throw err;
                let dbo = db.db("kalpas_project");
                dbo.collection("services").drop(function(err, delOK) {
                    if (err) throw err;
                    if (delOK) res.send("Collection deleted");
                    db.close();
                });
    });
                
                
                   /**
                       Number of documents inserted: 5
                   **/
                   
                
    
})
 
// Create a Server
app.listen(PORT,function(req,res){
    console.log("Server started on 3000");
})