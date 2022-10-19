// routes/doctor.js routing file
"use strict";
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

let router = express.Router();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6jd9d0.mongodb.net/${process.env.DB}`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

router.use(function(req, res, next) {
  console.log(req.url, "@", Date.now());
  next();
});

async function run(){
  try{
    await client.connect();
    router
      .route("/")
      .get(async(req, res) => {
        ///doctors
        const blogsCollection = client.db(process.env.DB).collection('blogs');
        const query = {};
        const cursor = blogsCollection.find(query);
        const doctors = await cursor.toArray();
        res.send(doctors);
      })
      .post(async(req, res) => {
        const newDoctor = req.body;
        console.log(newDoctor);
        const blogsCollection = client.db(process.env.DB).collection('blogs');
        const result = await blogsCollection.insertOne(newDoctor);
        res.send(result);
      });

    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const blogsCollection = client.db(process.env.DB).collection('blogs');
        const query = {};
        const cursor = blogsCollection.find(query);
        let doctor = await cursor.toArray();
        doctor = await doctor.filter((doctor) => doctor._id == id);
        res.send(doctor);
      })
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const blogsCollection = client.db(process.env.DB).collection('blogs');
        let doctor = await blogsCollection.findOne(query);
        console.log(doctor);      
        doctor = {...doctor, ...req.body};
        const result = await blogsCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: doctor }
        );
        const newResult = await blogsCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;