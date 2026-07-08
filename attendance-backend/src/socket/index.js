const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            credentials: true,
        },
    });

    // Auth middleware — verifies JWT sent from client during connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication token missing"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id)
                .select("employeeId branchId companyId role");

            socket.user = {
                ...decoded,
                role: decoded.role || user?.role,
                companyId: decoded.companyId || user?.companyId,
                branchId: decoded.branchId || user?.branchId,
                employeeId: decoded.employeeId || user?.employeeId,
            };
            next();
        } catch (error) {
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        const { id, branchId, companyId, role, employeeId } = socket.user || {};
        const activeBranchId = socket.handshake.auth?.branchId;
        const roomBranchId = role === "COMPANY_ADMIN"
            ? (activeBranchId || branchId)
            : branchId;



        console.log("========================================");
        console.log("New socket connected:", socket.id);
        console.log("Decoded JWT user:", socket.user);
        console.log("branchId from token:", branchId);
        console.log("branchId from socket auth:", activeBranchId);
        // Branch-level room — branch admins/managers listen here
        if (roomBranchId) {
            console.log("Joining room:", `branch:${roomBranchId}`)
            socket.join(`branch:${roomBranchId}`);
        }

        if (id) {
            socket.join(`user:${id}`);
        }

        if (employeeId) {
            console.log("Joining employee room:", `employee:${employeeId}`);
            socket.join(`employee:${employeeId}`);
        }

        socket.on("branch:join", (branchIdToJoin) => {
            const targetBranchId = role === "COMPANY_ADMIN"
                ? branchIdToJoin
                : branchId;

            if (!targetBranchId) {
                return;
            }

            console.log("Joining room by client event:", `branch:${targetBranchId}`);
            socket.join(`branch:${targetBranchId}`);
        });

        // Company-level room — company admin can listen to all branches if needed
        if (companyId) {
            socket.join(`company:${companyId}`);
        }

        console.log(`Socket connected: ${socket.id} (role: ${role})`);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized. Call initSocket first.");
    }
    return io;
};

module.exports = { initSocket, getIO };
