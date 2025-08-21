import e from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cors from 'cors'
import authRoutes from "./routes/auth.routes.js";

const app = e();


app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }))
app.use(cookieParser())

app.use(e.json())


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api/v1/auth', authRoutes);



// Errors
app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })
})
