const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bh4gk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("apartment-sales");
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("reviews");
        const apartmentsInfoCollection = database.collection("apartments_info");
        const scheduleCollection = database.collection("schedules")


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await usersCollection.findOne(filter);
            let isAdmin = false;
            if (result.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        //post users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        //put an admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        //get reviews
        app.get('/reviews', async (req, res) => {
            const user = reviewCollection.find({}).sort({ $natural: -1 });
            const cursor = await user.toArray();
            res.send(cursor)
        })

        //post reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        })

        //get apartment info by id
        app.get('/apartments_info/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const apartment_info = await apartmentsInfoCollection.findOne(query);
            console.log(apartment_info)
            res.json(apartment_info)
        })

        //get apartments info
        app.get('/apartments_info', async (req, res) => {
            const apartment_info = apartmentsInfoCollection.find({}).sort({ $natural: -1 });
            const result = await apartment_info.toArray();
            res.json(result)
        })



        //post apartments info
        app.post('/apartments_info', async (req, res) => {
            const apartment_info = req.body;
            const result = await apartmentsInfoCollection.insertOne(apartment_info);
            res.json(result)
        })

        //delete apartment
        app.delete('/apartments_info/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await apartmentsInfoCollection.deleteOne(query);
            res.json(result)
        })


        //get user schedule
        // app.get('/schedules', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { user_email: email };
        //     const schedules = scheduleCollection.find(query).sort({ $natural: -1 });
        //     const result = await schedules.toArray();
        //     res.json(result)
        // })

        //get all schedule
        app.get('/schedules', async (req, res) => {
            const schedules = scheduleCollection.find({}).sort({ $natural: -1 });
            const result = await schedules.toArray();
            console.log(result)
            res.json(result)
        })

        //post schedule
        app.post('/schedules', async (req, res) => {
            const schedule = req.body;
            schedule.status = 'pending';
            const result = await scheduleCollection.insertOne(schedule);
            res.json(result)
        })

        //update schedule
        app.put('/schedules/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Confirmed"
                },
            };
            const result = await scheduleCollection.updateOne(query, updateDoc, options);
            console.log(result)
            res.json(result)

        })
        //delete schedule by user
        app.delete('/schedules/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await scheduleCollection.deleteOne(query);
            res.json(result)
        })


    } finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Apartment Sales Website Server');
})

app.listen(port, () => {
    console.log('listening from: ', port);
})