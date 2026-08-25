const { createClient } = require("redis");

const client = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

client.on("error", (err) => {
    console.error("Redis error:", err.message);
});

client.on("connect", () => {
    console.log("Redis connected successfully");
});


(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error("Redis connection failed:", err.message);
    }
})();

module.exports = client;
