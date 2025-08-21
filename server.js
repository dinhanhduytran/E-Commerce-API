import e from "express";
import "dotenv/config";
import connectDB from "./config/db.js";


const app = e();

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})