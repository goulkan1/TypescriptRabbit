import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { createConnection } from "typeorm";
import { Product } from "./entity/product"
import * as amqp from 'amqplib/callback_api'

createConnection().then((db) => {
  const productRepository = db.getRepository(Product);

  amqp.connect("amqps://uxfpicer:wrkXarLhwelMJxm-FJ6mxnvQH7ZvGS6d@cougar.rmq.cloudamqp.com/uxfpicer", (err0, connection) => {
    if (err0) {
      throw err0
    }
    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1
      }
      const app = express();

      app.use(
        cors({
          origin: [
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:4200",
          ],
        })
      );

      app.use(express.json());

      app.get("/api/products", async (req: Request, res: Response) => {
        const product = await productRepository.find();
        res.send(product);
      });

      app.post("/api/products", async (req: Request, res: Response) => {
        const product = await productRepository.create(req.body)
        const result = await productRepository.save(product);
        channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));
        return res.send(result);
      })

      app.get("/api/products/:id", async (req: Request, res: Response) => {
        const product = await productRepository.findOne(req.params.id)
        return res.send(product);
      })

      app.put("/api/products/:id", async (req: Request, res: Response) => {
        const product = await productRepository.findOne(req.params.id)
        productRepository.merge(product, req.body);
        const result = await productRepository.save(product)
        channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));
        return res.send(result);
      })

      app.delete("/api/products/:id", async (req: Request, res: Response) => {
        const product = await productRepository.delete(req.params.id);
        channel.sendToQueue('product_deleted', Buffer.from(req.params.id));
        return res.send(product);
      })

      app.post("/api/products/:id/like", async (req: Request, res: Response) => {
        const product = await productRepository.findOne(req.params.id);
        product.likes++;
        const result = await productRepository.save(product);
        return res.send(result);
      })
      console.log("listen port 8000");

      app.listen(8000);
      process.on("beforeExit", () => {
        console.log('closing');
        connection.close();

      })
    })
  })


});
