require("dotenv").config();

const http = require("http");
const app = require("./app");


const {initSocket} = require('./socket');
const connectDB = require("./config/db");


const server = http.createServer(app);
initSocket(server);
// connectDB();

const PORT = process.env.PORT || 5000;

(async () => {
    await connectDB();
    require("./cron/attendanceCron");

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
