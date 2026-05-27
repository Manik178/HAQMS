const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
// Highly inefficient nested loop aggregate reporting for admin/receptionists dashboard
// PERFORMANCE BUG: Performs multiple nested DB queries inside a loop for every doctor.
// Runs sequentially, blocking/scaling terrible with doctors count.
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run all queries in parallel — no per-doctor loops
    const [doctors, totalByDoctor, completedByDoctor, cancelledByDoctor, queueByDoctor] = await Promise.all([
      prisma.doctor.findMany(),
      prisma.appointment.groupBy({
        by: ['doctorId'],
        _count: { id: true },
      }),
      prisma.appointment.groupBy({
        by: ['doctorId'],
        where: { status: 'COMPLETED' },
        _count: { id: true },
      }),
      prisma.appointment.groupBy({
        by: ['doctorId'],
        where: { status: 'CANCELLED' },
        _count: { id: true },
      }),
      prisma.queueToken.groupBy({
        by: ['doctorId'],
        where: { createdAt: { gte: today } },
        _count: { id: true },
      }),
    ]);

    // Build lookup maps for O(1) access
    const totalMap = Object.fromEntries(totalByDoctor.map(r => [r.doctorId, r._count.id]));
    const completedMap = Object.fromEntries(completedByDoctor.map(r => [r.doctorId, r._count.id]));
    const cancelledMap = Object.fromEntries(cancelledByDoctor.map(r => [r.doctorId, r._count.id]));
    const queueMap = Object.fromEntries(queueByDoctor.map(r => [r.doctorId, r._count.id]));

    const reportData = doctors.map(doc => {
      const completedCount = completedMap[doc.id] || 0;
      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        totalAppointments: totalMap[doc.id] || 0,
        completedAppointments: completedCount,
        cancelledAppointments: cancelledMap[doc.id] || 0,
        todayQueueSize: queueMap[doc.id] || 0,
        revenue: completedCount * doc.consultationFee,
      };
    });

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      timeTakenMs: durationMs,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

module.exports = router;
