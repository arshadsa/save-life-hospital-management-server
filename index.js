const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@products.q5pma.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db(process.env.DB)
      .collection(process.env.COLLECTION);
    const orderCollection = client.db(process.env.DB).collection("order");

    // AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // PRODUCTS API - READ ALL
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/user/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = {};
      const cursor = productsCollection.find(query);
      let products = await cursor.toArray();
      products = await products.filter((product) => product.uid == id);
      res.send(products);
    });

    //READ - ONE
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // POST, CREATE
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // UPDATE
    app.post("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log(req.body);
      const query = { _id: ObjectId(id) };
      let product = await productsCollection.findOne(query);
      console.log(product);

      if (req.body.increaseByOne) product.quantity = product.quantity + 1;
      else if (req.body.decreaseByOne) {
        product.quantity = product.quantity - 1;
        product.quantitySold = product.quantitySold + 1;
      } else if (req.body.newQuantity) product.quantity = req.body.newQuantity;
      else if (req.body.addQuantity)
        product.quantity = product.quantity + req.body.addQuantity;
      else if(req.body.edititem)
        {
            product = {...product, ...req.body}
        }

      const result = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: product }
      );

      const newResult = await productsCollection.findOne(query);
      res.send(newResult);
    });

    // DELETE
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // // Order Collection API

    // app.get('/order', verifyJWT, async (req, res) => {
    //     const decodedEmail = req.decoded.email;
    //     const email = req.query.email;
    //     if (email === decodedEmail) {
    //         const query = { email: email };
    //         const cursor = orderCollection.find(query);
    //         const orders = await cursor.toArray();
    //         res.send(orders);
    //     }
    //     else{
    //         res.status(403).send({message: 'forbidden access'})
    //     }
    // })

    //CREATE
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Products Server");
});

app.get("/hero", (req, res) => {
  res.send("Hero meets hero ku");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
