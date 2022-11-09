const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('secureIT').collection('services');
        const reviewCollection = client.db('secureIT').collection('reviews');

        app.post("/services", async (req, res) => {
            try {
                const result = await serviceCollection.insertOne(req.body);

                if (result.insertedId) {
                    res.send({
                        success: true,
                        message: `Successfully created the ${req.body.name} `,
                    });
                } else {
                    res.send({
                        success: false,
                        error: "Couldn't create the Service",
                    });
                }
            } catch (error) {
                console.log(error.name, error.message);
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });
        //reviews
        app.post("/reviews", async (req, res) => {
            try {
                const result = await reviewCollection.insertOne(req.body);

                if (result.insertedId) {
                    res.send({
                        success: true,
                        message: `Successfully created the ${req.body.name} `,
                    });
                } else {
                    res.send({
                        success: false,
                        error: "Couldn't create review",
                    });
                }
            } catch (error) {
                console.log(error.name, error.message);
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        // app.delete('/reviews/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await reviewCollection.deleteOne(query);
        //     res.send(result);
        // })

    }
    finally {

    }
}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('SecureIT server is running')
})

app.listen(port, () => {
    console.log(`SecureIT server running on ${port}`);
})