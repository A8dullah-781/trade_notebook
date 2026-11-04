import express from "express";
import authRoutes from './routes/auth.routes.js'
import { errorHandler } from "./middleware/errorHandler.js";
import meRoutes from './routes/me.routes.js'
import strategyRoutes from './routes/strategies.routes.js'


const app = express()

app.use(express.json());
app.use('/auth', authRoutes)  
app.use('/me', meRoutes)
app.use('/strategies', strategyRoutes)

app.get('/health', (req, res)=>{
     res.status(200).json({status: "ok"})
     //Interview note: res.status(200).json(...) is method chaining: status() sets the HTTP status code and returns the response object, so .json() can be called right after it. 200 means “OK”.
})
app.use(errorHandler);

export default app