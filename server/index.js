const express = require("express");
require("./db/config");
const cors = require("cors");
const User = require("./db/User");
const multer = require('multer');
const fs = require('fs');
const Product= require("./db/Product")

const app= express();

app.use(express.json());
app.use(cors());
app.use('/uploads',express.static('uploads'));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads'); // specify the destination folder where the file will be saved
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // generate a unique filename for the uploaded file
  }
});
const upload = multer({ storage: storage });


app.post("/register", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    resp.send(result);
});

app.post("/login", async (req, resp) => {
    if(req.body.password && req.body.email)
    {
        let user = await User.findOne(req.body).select("-password")
    if(user)
    {
        resp.send(user)
    }else{
        resp.send({result:"No User Found"})
    }
    }else{
        resp.send({result:"No User Found"})
    }
});

app.post('/add-product', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category,userId } = req.body;
    const product = new Product({
      name,
      price,
      category,
      userId,
      image: req.file.path // store the URL of the uploaded image in the 'image' field of the new product
    });
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

  app.get('/product', async (req, res) => {
    let products= await Product.find();
    if(products.length>0){
        res.send(products)
    }else{
        res.send({result:"No Products Found"})
    }
  });

  app.get("/product/:category", async(req,resp)=>{
    var categorySlug = req.params.category
    const result = await Product.find({category:categorySlug})
    if(result){
        resp.send(result)
    }else{
        resp.send({result:"NO data Found"})
    }
});

app.listen(5000);