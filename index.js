const express= require('express');
const path= require('path');
const formidable = require('formidable');
const mv = require('mv');
const compress_images = require("compress-images");
var PngQuant = require('pngquant');
const fs= require('fs');
const app =express();

const OUTPUT_path = __dirname+"/images/";
const Com_path = __dirname+"/compress/";

const INPUT_path_to_your_images = 'images/**/*.{jpg,JPG,jpeg,JPEG,png}';

app.use('/views', express.static(path.join(__dirname, 'views')))
app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
  var pic='1648395300956-m.png';
  fs.readFile('./compress/'+ pic, function (err, content) {
    if (err) {
        res.writeHead(400, {'Content-type':'text/html'})
        console.log(err);
        res.end("No such image");    
    } else {
        //specify the content type in the response will be an image
        res.writeHead(200,{'Content-type':'image/png'});
        res.end(content);
    }
});
})
app.get('/upload',(req,res)=>{
    if (req.headers['content-type'] === 'image/png') {
        res.writeHead(200, {
          'Content-Type': 'image/png'
        });
        var mfilename= Date.now()+'-m.png';
        const myfile =fs.createWriteStream('./compress/'+mfilename);
        req.pipe(new PngQuant([128])).pipe(myfile);  
               
       res.end('file uploaded:'+mfilename);
      } else {
        res.writeHead(400);
        res.end('Feed me a PNG!');
      }
})
app.post('/myupload',(req,res)=>{              
    
    if (req.url === '/myupload' && req.method.toLowerCase() === 'post') {
        // parse a file upload
        const form = formidable({ multiples: true });
    
        form.parse(req, (err, fields, files) => {
          if (err) {
            res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
            res.end(String(err));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'image/png' });
          req.pipe(new PngQuant([128])).pipe(files.image_upload.filepath);
         
          console.log(files.image_upload.filepath);
          res.end(JSON.stringify({ fields, files }, null, 2));
        });
    
        return;
      }
    
})


app.post('/myuploads',(req,res)=>{              
    
    if (req.url === '/myuploads' && req.method.toLowerCase() === 'post') {
        // parse a file upload
        const form = formidable({ multiples: true });
    
        form.parse(req, (err, fields, files) => {
          if (err) {
            res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
            res.end(String(err));
            return;
          }
          var oldpath = files.image_upload.filepath;
          var newpath = OUTPUT_path + files.image_upload.originalFilename;
          console.log(files.image_upload.filepath);
          res.end(JSON.stringify({ fields, files }, null, 2));
          mv(oldpath, newpath, function (err) {
            if (err) throw err;
            res.write('File uploaded and moved!');
            res.end();
          });
          compress_images(INPUT_path_to_your_images, Com_path, { compress_force: false, statistic: true, autoupdate: true }, false,
            { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
            { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
            { svg: { engine: "svgo", command: "--multipass" } },
            { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
function (error, completed, statistic) {
console.log("-------------");
console.log(error);
console.log(completed);
console.log(statistic);
console.log("-------------");
}
);
          
        });
    
        return;
      }
    
})

app.get('/home',(req,res)=>{
   
    res.render('home');
    
})

app.listen(5000);




