import express from "express";

import {
    protect,
    admin,
} from "../middleware/authMiddleware";

import {
    getPlatformStats,
    getDisputes,
    resolveDispute,
} from "../controllers/adminController";

const router = express.Router();

router.get(
    "/stats",
    protect,
    admin,
    getPlatformStats
);

router.get(
    "/disputes",
    protect,
    admin,
    getDisputes
);

router.put(
    "/disputes/:disputeId/resolve",
    protect,
    admin,
    resolveDispute
);

export default router;