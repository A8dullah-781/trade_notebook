import express from "express";
import authRoutes from './routes/auth.routes.js'
import { errorHandler } from "./middleware/errorHandler.js";
import meRoutes from './routes/me.routes.js'
import strategyRoutes from './routes/strategies.routes.js'
import pairsRoutes from './routes/pairs.routes.js'
import tradesRoute from './routes/trades.routes.js'

const app = express()

// CLOUDINARY_URL=cloudinary://678254147711655:eivYbbX-6crtla0c_9VhGoJolF0@xeosyafd

app.use(express.json());
app.use('/auth', authRoutes)  
app.use('/me', meRoutes)
app.use('/strategies', strategyRoutes)
app.use('/pairs', pairsRoutes)
app.use('/trades', tradesRoute)

app.get('/health', (req, res)=>{res.status(200).json({status: "ok"})})

app.use(errorHandler);

export default app