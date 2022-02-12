import * as express from "express";
import * as cors from "cors";
import { Request, Response } from "express";
import { createConnection } from "typeorm"
import * as amqp from 'amqplib/callback_api'
import { Product } from "./entity/product";
import axios from "axios";

createConnection().then(db => {

    const productRepository = db.getMongoRepository(Product);
    amqp.connect("amqps://uxfpicer:wrkXarLhwelMJxm-FJ6mxnvQH7ZvGS6d@cougar.rmq.cloudamqp.com/uxfpicer", (err0, connection) => {
        if (err0) {
            throw err0
        }
        connection.createChannel((err1, channel) => {
            if (err1) {
                throw err1
            }
            channel.assertQueue('hello', { durable: true })

            const app = express();
            app.use(
                cors({
                    origin: [
                        "https://localhost:3000",
                        "https://localhost:8000",
                        "https://localhost:4200",
                    ],
                })
            );

            app.use(express.json());
            // channel.consume('hello', (msg) => {
            //     console.log(msg.content.toString());
            // })

            channel.consume("product_created", async (msg) => {
                const eventProduct: Product = JSON.parse(msg.content.toString())
                const product = new Product()
                product.admin_id = parseInt(eventProduct.id)
                product.title = eventProduct.title
                product.image = eventProduct.image
                product.likes = eventProduct.likes
                await productRepository.save(product)
                console.log('product created');
            }, { noAck: true });

            channel.consume("product_updated", async (msg) => {
                const eventProduct: Product = JSON.parse(msg.content.toString())
                // console.log(eventProduct, msg.content);
                const product = await productRepository.findOne({ admin_id: parseInt(eventProduct.id) })
                productRepository.merge(product, {
                    title: eventProduct.title,
                    image: eventProduct.image,
                    likes: eventProduct.likes
                })
                await productRepository.save(product)
                console.log("product updated");
            }, { noAck: true })

            channel.consume('product_deleted', async (msg) => {
                const admin_id = parseInt(msg.content.toString())
                await productRepository.deleteOne({ admin_id })
                console.log("product deleted");
            })

            app.get('/products', async (req, res) => {
                const product = await productRepository.find()
                return res.send(product)
            })

            app.post('/products/:id/like', async (req, res) => {
                const product = await productRepository.findOne(req.params.id)
                await axios.post(`http://localhost:8000/api/products/${product.admin_id}/like`, {})
                product.likes++
                await productRepository.save(product)
                return res.send(product)
            })

            console.log("Listen to port 8001");
            app.listen(8001);

            process.on("beforeExit", () => {
                console.log('closing');
                connection.close();

            })
        })
    })

})

