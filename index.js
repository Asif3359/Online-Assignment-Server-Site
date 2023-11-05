const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ylhegt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const AssignmentsCollection = client.db("Assignment").collection("Assignments");
        // const bookingCollection = client.db("Assignment").collection("bookings");

        // getAssignment 
        app.get('/assignment', async (req, res) => {
            const cursor = AssignmentsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // getIndividual Assignment 
        app.get('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: { title: 1, marks: 1,  thumbnailURL: 1 },
            };

            const result = await AssignmentsCollection.findOne(query, options);
            res.send(result);
        })
        app.post('/assignment', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await AssignmentsCollection.insertOne(booking);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car Doctor Is Running');
});
app.listen(port, () => {
    console.log(`car Doctor Server IS Running on port ${port}`);
})