import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { createConnection } from "typeorm";
import { Product } from "./entity/product"

createConnection().then((db) => {
  const app = express();
  const productRepository = db.getRepository(Product);

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
    return res.send(result);
  })

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    const product = await productRepository.delete(req.params.id);
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
});
