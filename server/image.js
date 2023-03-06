const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      fs = require("fs"),
      multer = require("multer"),
      mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/e-commerce");      
app.use(bodyParser.urlencoded(
      { extended:true }
))

//Schema
const imgSchema = mongoose.Schema({
    img:{data:Buffer,contentType: String}
});
const image = mongoose.model("Images",imgSchema); 
// SET STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
  const upload = multer({ storage: storage })
  //Routes
app.get("/",(req,res)=>{
    res.render("index");
});
app.post("/product",upload.single('image'),(req,res)=>{
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');
    var final_img = {
        contentType:req.file.mimetype,
        image:new Buffer(encode_img,'base64')
    };
    image.create(final_img,function(err,result){
        if(err){
            console.log(err);
        }else{
            console.log(result.img.Buffer);
            console.log("Saved To database");
            console.log(final_img.image)
            res.contentType(final_img.contentType);
            res.send(final_img.image);
        }
    })
})
//Code to start server
app.listen(5000);