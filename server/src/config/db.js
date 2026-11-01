import pg from "pg"
const {Pool} = pg

//“What is a connection pool?” A cache of reusable database connections that avoids the cost of opening a new one for every request.

const pool = new Pool({

    //Connection string: one line holding everything needed to reach the database (user, password, host, port, name). Keeping it in .env means no secrets in code.

    connectionString: process.env.DATABASE_URL,
})

//“What happens when all connections are busy?” New queries wait in a queue until one is returned.

export default pool