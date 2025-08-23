"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
// Create a new express application instance
const app = express();
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
//# sourceMappingURL=app.js.map