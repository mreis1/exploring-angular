import mysql, { ConnectionOptions } from "mysql2/promise";

 const access: ConnectionOptions = {
    host: "localhost",
    port: 3306,
    database: "rxjs",
    user: "root",
    password: "Galaro1234$",
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
}

export const db = mysql.createPool(access);

console.log("Connected to database!");