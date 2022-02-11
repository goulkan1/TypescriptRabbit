import * as express from "express";
import * as cors from "cors";
import { Request, Response } from "express";
import { createConnection } from "typeorm"

createConnection().then(db => {
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
    console.log("Listen to port 8001");
    app.listen(8001);

})