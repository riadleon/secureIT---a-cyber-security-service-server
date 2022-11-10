const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken')

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function toVerifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('secureIT').collection('services');
        const reviewCollection = client.db('secureIT').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
            res.send({ token })
        })

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

        app.post("/reviews", toVerifyJWT, async (req, res) => {
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

        app.get('/reviews', toVerifyJWT, async (req, res) => {

            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // app.post('/reviews', async (req, res) => {
        //     const review = req.body;
        //     const result = await reviewCollection.insertOne(review);
        //     res.send(result);
        // });


        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        app.get('/reviews/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { review: id };
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        });

        app.delete("/reviews/:id", toVerifyJWT, async (req, res) => {
            const { id } = req.params;

            try {
                const review = await reviewCollection.findOne({ _id: ObjectId(id) });

                if (!review?._id) {
                    res.send({
                        success: false,
                        error: "review doesn't exist",
                    });
                    return;
                }

                const result = await reviewCollection.deleteOne({ _id: ObjectId(id) });

                if (result.deletedCount) {
                    res.send({
                        success: true,
                        message: `Successfully deleted the ${review.serviceName}`,
                    });
                } else {
                }
            } catch (error) {
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

        app.patch("/reviews/edit/:id", toVerifyJWT, async (req, res) => {
            const { id } = req.params;

            try {
                const result = await reviewCollection.updateOne({ _id: ObjectId(id) }, { $set: req.body.status });

                if (result.matchedCount) {
                    res.send({
                        success: true,
                        message: `successfully updated ${req.body.userName} comment`,
                    });
                } else {
                    res.send({
                        success: false,
                        error: "Couldn't update  the product",
                    });
                }
            } catch (error) {
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

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