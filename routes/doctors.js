// routes/doctor.js routing file
"use strict";

const {express, ObjectId, router, client}= require('./CommonImports');

async function run() {
  ///doctors
  const doctorsCollection = client.db(process.env.DB).collection("hospitaldoctors");

  try {
    await client.connect();
    router
      .route("/")
      .get(async (req, res) => {
        const query = {};
        const cursor = doctorsCollection.find(query);
        const doctors = await cursor.toArray();
        res.send(doctors);
      })
      .post(async (req, res) => {
        const newDoctor = req.body;
        console.log(newDoctor);
        const result = await doctorsCollection.insertOne(newDoctor);
        await res.send(result);
      });
      
    router.route("/specialities").get(async (req, res) => {
      const specialityCollection = client.db(process.env.DB).collection("hospitaldoctors");
      const specialities = await specialityCollection.distinct("specialization");
      
      await res.send(specialities);
    });

    router.route("/specialitiesDef").get(async (req, res) => {
      const specialityDefCollection = client.db(process.env.DB).collection("specialityDefinition");
      const query = {};
      const cursor = specialityDefCollection.find(query);
      const specialityDef = await cursor.toArray();
      
      res.send(specialityDef);
    });

    router
      .route("/:id")
      .get(async (req, res) => {
        const query = {};
        const cursor = doctorsCollection.find(query);
        const doctors = await cursor.toArray();
        res.send(doctors);
      })
      .post(async (req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        let doctor = await doctorsCollection.findOne(query);
        console.log(doctor);
        doctor = { ...doctor, ...req.body };
        const result = await doctorsCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: doctor }
        );
        const newResult = await doctorsCollection.findOne(query);
        res.send(newResult);
      })
      .delete(async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await doctorsCollection.deleteOne(query);
        res.send(result);
      });
  } finally {
  }
}

run().catch(console.dir);

module.exports = router;