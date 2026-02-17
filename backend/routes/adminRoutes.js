const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  suspendEvent,
  getEventRegistrations,
  sendAnnouncement,
  getReports,
  getAuditLogs,
} = require("../controllers/adminController");

// All routes are protected and require admin role
router.use(auth);
router.use(authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/deactivate", deactivateUser);
router.put("/events/:id/suspend", suspendEvent);
router.get("/events/:id/registrations", getEventRegistrations);
router.post("/announcement", sendAnnouncement);
router.get("/reports", getReports);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
