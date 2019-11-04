const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const path = require("path");
const Product = require('./models/Product');
// const keys = require('./config/keys');
const multer = require("multer");
const mongoose = require('mongoose');


// Set up MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }).then(() => console.log("MongoDB connected")).catch(err => console.log(err));

// Set up multipart form data
const upload = multer({
  // dest: __dirname + "/uploads/images",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    // if (file.originalname.match(/\.(jpeg|jpg|png)$/))
    if (!file.originalname.endsWith('.jpg')) {
      return cb(new Error('Please upload a jpg'));
    }
    cb(undefined, true)
  }
});

// Serve static assets
app.use(express.static(path.join(__dirname, "/public")));

// Parse request bodies
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/home.html"));
});

app.get("/products/pending", async (req, res) => {
  try {
    const products = await Product.find({status: "pending"});
    res.send({products});
  } catch(e) {
    res.send({message: e});
  }
});

app.get("/products/approved", async (req, res) => {
  try {
    const products = await Product.find({status: "approved"});
    res.send({products});
  } catch(e) {
    res.send({message: e});
  }
});

app.get("/products/rejected", async (req, res) => {
  try {
    const products = await Product.find({status: "rejected"});

    if (!products) {
      res.send({});
    }
    res.send({products, reason: products.reason});

  } catch(e) {
    res.send({message: e});
  }
});

app.post("/products/rejected/:id", async (req, res) => {
  try {
    const pId = req.params.id;
    await Product.updateOne({pId}, {status: "rejected", reason: "Pictures are blurry"});
    res.send({message: 'Product has been successfully updated to rejected status'});
  } catch (e) {
    res.send({error: e});
  }
});

app.post("/products/approved/:id", async (req, res) => {
  try {
    const pId = req.params.id;
    await Product.updateOne({pId}, {status: "approved"});
    res.send({message: 'Product has been updated to approved status'});
  } catch(e) {
    res.send({message: e});
  }
});

app.post("/products/rejected/:id", async (req, res) => {
  // const pId = req.params.id;
  // console.log('This is the xhr request body for rejected products', req.body);
  // await Product.updateOne({pId}, {status: "approved"});
  // res.send({message: 'Product has been updated'});
  // await Product.updateOne({pId})
  res.send()
});

app.post("/upload", upload.single("photo"), async (req, res) => {
  console.log('req.file', req.file);
  console.log('name: ', req.body.name);

  const product = new Product({
    pId: req.body.pid,
    name: req.body.name,
    // status: "rejected",
    image: req.file.buffer
  });

  await product.save();
  // res.set('Content-Type', 'image/jpg')
  res.send({
    name: req.body.name,
    image: req.file.buffer
  });
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
});

app.listen(port, () => {
  console.log("Server is up and running and listening on port", port);
});
