const express = require("express");
const cors = require("cors");
const expresss = require("express");
const path = require("path");




const app = express();

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Branch-Id"]
    })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
    res.send("Attendance SaaS API Running");
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/test",require("./routes/test.routes"));
app.use("/api/super-admin",require("./routes/super-admin.routes"));
app.use("/api/company",require("./routes/company.routes"));
app.use("/api/branch",require("./routes/branch.routes"));
app.use("/api/employee",require("./routes/employee.routes"));
app.use("/api/notifications",require("./routes/notifications.routes"));
app.use("/api/settings",require("./routes/settings.routes"));
app.use("/api/payments",require("./routes/payment"));

module.exports = app;