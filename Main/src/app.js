"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
(0, typeorm_1.createConnection)().then(function (db) {
    var app = express();
    app.use(cors({
        origin: [
            "https://localhost:3000",
            "https://localhost:8000",
            "https://localhost:4200",
        ],
    }));
    app.use(express.json());
    console.log("Listen to port 8001");
    app.listen(8001);
});
