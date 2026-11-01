import "dotenv/config"
//Imports run before the rest of your code. Load .env first (import "dotenv/config" as the first import), so every file after it can read the variables.
import app from "./app.js"

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Bismillah, Server running on ${PORT}`)
})