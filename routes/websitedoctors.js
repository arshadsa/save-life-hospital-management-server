// routes/doctor.js routing file
"use strict";
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

let router = express.Router();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6jd9d0.mongodb.net/${process.env.DB}`;



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// router.use(function(req, res, next) {
//   console.log(req.url, "@", Date.now());
//   ;
// });

async function run(){
  try{
    await client.connect();
    router
      .route("/")
      .get(async(req, res) => {
        console.log("hello from websitedoctorsaa")
        ///doctors
        const websitedoctorsCollection = client.db(process.env.DB).collection('websitedoctors');
        const query = {};
        const cursor = websitedoctorsCollection.find(query);
        const doctors = await cursor.toArray();
        res.send(doctors);
      })
      .post(async(req, res) => {
        const newDoctor = req.body;
        console.log(newDoctor);
        const websitedoctorsCollection = client.db(process.env.DB).collection('websitedoctors');
        const result = await websitedoctorsCollection.insertOne(newDoctor);
        res.send(result);
      });

    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const doctorsCollection = client.db(process.env.DB).collection('websitedoctors');
        const query = {};
        const cursor = doctorsCollection.find(query);
        let doctor = await cursor.toArray();
        doctor = await doctor.filter((doctor) => doctor._id == id);
        res.send(doctor);
      })
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const websitedoctorsCollection = client.db(process.env.DB).collection('websitedoctors');
        let doctor = await websitedoctorsCollection.findOne(query);
        console.log(doctor);      
        doctor = {...doctor, ...req.body};
        const result = await websitedoctorsCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: doctor }
        );
        const newResult = await websitedoctorsCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;