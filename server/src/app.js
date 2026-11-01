import express from "express";

const app = express()

app.use(express.json());

app.get('/health', (req, res)=>{
     res.status(200).json({status: "ok"})
     //Interview note: res.status(200).json(...) is method chaining: status() sets the HTTP status code and returns the response object, so .json() can be called right after it. 200 means “OK”.
})

export default app