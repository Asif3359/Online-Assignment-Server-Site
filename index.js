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

const verify = async (req, res, next)=>{

    const token = req.cookies?.token;
    if(!token){
        res.status(401).send({Status:"unAuthorized Access", code:"401"});
        return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error, decode)=>{
        if(error){
            res.status(401).send({Status:"unAuthorized Access", code:"401"});
        }
        else{
            // console.log(decode);
            req.decode=decode;
        }
    });
    next();
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const AssignmentsCollection = client.db("Assignment").collection("Assignments");
        const SubmitAssignmentsCollection = client.db("Assignment").collection("SubmitAssignments");
        // const bookingCollection = client.db("Assignment").collection("bookings");

        app.post('/jwt',async(req,res)=>{
            const user=req.body;

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"10h"});
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate()+7);
            res.cookie("token",token,{
                httpOnly:true,
                secure:false,
                expires:expirationDate,
            }).send({message:"success"});
        });
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
            const result = await AssignmentsCollection.findOne(query);
            res.send(result);
        })
        //create assignment
        app.post('/assignment',verify, async (req, res) => {
            const assignment = req.body;
            // console.log(assignment);
            const result = await AssignmentsCollection.insertOne(assignment);
            res.send(result);
        });
        // update 
        app.put('/assignment/:id',verify, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateAssignment = req.body;
            const assignment = {
                $set: {
                    title: updateAssignment.title,
                    marks: updateAssignment.marks,
                    thumbnailURL: updateAssignment.thumbnailURL,
                    difficulty: updateAssignment.difficulty,
                    dueDate: updateAssignment.dueDate,
                    description: updateAssignment.description,
                    email: updateAssignment.email,
                    photoURL: updateAssignment.photoURL,
                    displayName: updateAssignment.displayName,

                }
            }
            const result = await AssignmentsCollection.updateOne(filter, assignment, options);
            res.send(result);
        })
        // delete 
        app.delete('/assignment/:id',verify, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AssignmentsCollection.deleteOne(query);
            res.send(result);
        })

        //create Submit Assignment
        app.post('/submitAssignment',verify, async (req, res) => {
            const submitAssignment = req.body;
            // console.log(submitAssignment);
            const result = await SubmitAssignmentsCollection.insertOne(submitAssignment);
            res.send(result);
        });
        // get submit Assignment 
        app.get('/submitAssignment', verify, async (req, res) => {
            const cursor = SubmitAssignmentsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });
        // get spacific submit assignment 
        app.get('/submitAssignment/:id',verify, async (req, res) => {

            // console.log(req.decode);
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await SubmitAssignmentsCollection.findOne(query);
            res.send(result);
        });
        // update 
        app.put('/submitAssignment/:id',verify, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateSubmitAssignment = req.body;
            const assignment = {
                $set: {
                    title: updateSubmitAssignment.title,
                    marks: updateSubmitAssignment.marks,
                    thumbnailURL: updateSubmitAssignment.thumbnailURL,
                    difficulty: updateSubmitAssignment.difficulty,
                    dueDate: updateSubmitAssignment.dueDate,
                    description: updateSubmitAssignment.description,
                    email: updateSubmitAssignment.email,
                    pdfLink: updateSubmitAssignment.pdfLink,
                    notes: updateSubmitAssignment.notes,
                    examineeMarks: updateSubmitAssignment.examineeMarks,
                    submitEmail: updateSubmitAssignment.submitEmail,
                    userSubmit: updateSubmitAssignment.userSubmit,
                    pending: updateSubmitAssignment.pending,
                    feedBack: updateSubmitAssignment.feedBack,
                    // pdfLink,notes,title, marks,examineeMarks, thumbnailURL, difficulty, dueDate, description, email,submitEmail,userSubmit,pending,

                }
            }
            const result = await SubmitAssignmentsCollection.updateOne(filter, assignment, options);
            res.send(result);
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Assignment Server Is Running');
});
app.listen(port, () => {
    console.log(`'Assignment Server Is Running on port ${port}`);
})