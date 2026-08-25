// backend/controllers/queueController.js

import Queue        from '../models/Queue.js';
import Appointment  from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import {
  sendEmail,
  getQueueAlertHTML,
  getQueueAlertText,
} from '../utils/sendEmail.js';

const BASE_URL     = process.env.FRONTEND_URL || 'https://slotly.ksangam.dpdns.org';
// Alert patients who are this many positions away (2 = second in line)
const ALERT_AT_POSITIONS = [2, 3];

// India follows IST (UTC+5:30) — the server runs in UTC, so "today" must be
// computed relative to IST, not the server's own clock, or day boundaries
// shift incorrectly for anyone using the app late at night / early morning.
const getISTDateString = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// ─── Get queue for a department today ────────────────────────
export const getQueue = async (req, res) => {
  try {
    const { departmentId, date } = req.query;
    const queryDate = date ? new Date(date) : new Date(getISTDateString());

    const queue = await Queue.findOne({
      department: departmentId,
      date: {
        $gte: new Date(queryDate).setHours(0, 0, 0, 0),
        $lte: new Date(queryDate).setHours(23, 59, 59, 999),
      },
    }).populate({
      path: 'waitingList.appointment',
      populate: [
        { path: 'user',    select: 'name phone avatar' },
        { path: 'service', select: 'name duration'     },
      ],
    });

    if (!queue) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No queue found for today',
      });
    }

    return res.status(200).json({ success: true, data: queue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all queues today (admin) ─────────────────────────────
export const getAllQueues = async (req, res) => {
  try {
    const today = new Date(getISTDateString());
    const queues = await Queue.find({
      date: {
        $gte: new Date(today).setHours(0, 0, 0, 0),
        $lte: new Date(today).setHours(23, 59, 59, 999),
      },
    }).populate('department', 'name icon color');

    return res.status(200).json({
      success: true,
      count: queues.length,
      data: queues,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Call next token ──────────────────────────────────────────
export const callNext = async (req, res) => {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId).populate({
      path: 'waitingList.appointment',
      populate: { path: 'user', select: 'name' },
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    // Find next waiting token
    const nextItem = queue.waitingList.find(
      (item) => item.status === 'waiting'
    );

    if (!nextItem) {
      return res.status(200).json({
        success: false,
        message: 'No more patients in queue',
      });
    }

    // Mark previous as done if exists
    queue.waitingList.forEach((item) => {
      if (item.status === 'called' || item.status === 'serving') {
        item.status = 'done';
      }
    });

    // Update current token
    nextItem.status  = 'called';
    nextItem.calledAt = new Date();
    queue.currentToken  = nextItem.token;
    queue.currentNumber = nextItem.tokenNumber;
    queue.totalServed  += 1;

    await queue.save();

    // ── Notify the called patient ──────────────────────────────
    if (nextItem.appointment?.user) {
      await Notification.create({
        recipient: nextItem.appointment.user._id,
        title:     'Your token is being called!',
        message:   `Token ${nextItem.token} — please proceed to the counter now.`,
        type:      'queue_called',
        link:      '/live-queue',
      });
    }

    // ── Send "your turn is coming" alert to patients 2–3 positions ahead ──
    // Re-fetch the queue with full population so we have user emails
    const freshQueue = await Queue.findById(queue._id).populate({
      path: 'waitingList.appointment',
      populate: [
        { path: 'user',       select: 'name email' },
        { path: 'service',    select: 'name'       },
        { path: 'department', select: 'name icon'  },
      ],
    });

    const stillWaiting = freshQueue.waitingList
      .filter((item) => item.status === 'waiting')
      .sort((a, b) => a.tokenNumber - b.tokenNumber);

    const alertPromises = [];
    stillWaiting.forEach((item, idx) => {
      const position = idx + 1; // 1 = next up, 2 = second, etc.
      if (ALERT_AT_POSITIONS.includes(position) && !item.alertSent) {
        const apt  = item.appointment;
        const user = apt?.user;
        if (!user?.email) return;

        const avgMinutesPerPatient = 15;
        const estimatedMinutes     = (position - 1) * avgMinutesPerPatient;

        // Mark alert sent (in-memory, then bulk-save below)
        item.alertSent = true;

        // In-app notification
        alertPromises.push(
          Notification.create({
            recipient: user._id,
            title:     `⏰ ${position === 1 ? 'You are next!' : `${position} positions away`}`,
            message:   `Token ${item.token} — head to ${apt.department?.name || 'the clinic'} now.`,
            type:      'queue_alert',
            link:      '/live-queue',
          })
        );

        // Email alert (non-blocking)
        sendEmail({
          to:      user.email,
          subject: `⏰ Your Turn Is Coming – Token ${item.token}`,
          html: getQueueAlertHTML({
            name: user.name,
            appointment: apt,
            position,
            estimatedMinutes,
            baseUrl: BASE_URL,
          }),
          text: getQueueAlertText({
            name: user.name,
            appointment: apt,
            position,
            estimatedMinutes,
            baseUrl: BASE_URL,
          }),
        }).catch((err) =>
          console.error(`[callNext] Queue alert email failed for token ${item.token}:`, err.message)
        );
      }
    });

    // Persist alertSent flags + await in-app notifications
    if (alertPromises.length) {
      await Promise.all([
        freshQueue.save(),
        ...alertPromises,
      ]);
    }

    return res.status(200).json({
      success: true,
      message: `Called token ${nextItem.token}`,
      data: queue,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get queue position for a token ──────────────────────────
export const getQueuePosition = async (req, res) => {
  try {
    const { token, departmentId } = req.query;
    const today = new Date(getISTDateString());

    const queue = await Queue.findOne({
      department: departmentId,
      date: {
        $gte: new Date(today).setHours(0, 0, 0, 0),
        $lte: new Date(today).setHours(23, 59, 59, 999),
      },
    });

    if (!queue) {
      return res.status(200).json({
        success: true,
        data: { position: 0, currentToken: null, estimatedWait: 0 },
      });
    }

    const tokenItem = queue.waitingList.find((item) => item.token === token);
    if (!tokenItem) {
      return res.status(404).json({
        success: false,
        message: 'Token not found in queue',
      });
    }

    // Count people ahead
    const waitingAhead = queue.waitingList.filter(
      (item) =>
        item.status === 'waiting' &&
        item.tokenNumber < tokenItem.tokenNumber
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        token,
        status:        tokenItem.status,
        position:      waitingAhead + 1,
        currentToken:  queue.currentToken,
        currentNumber: queue.currentNumber,
        totalServed:   queue.totalServed,
        estimatedWait: waitingAhead * 15, // avg 15 min per patient
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Skip a token ─────────────────────────────────────────────
export const skipToken = async (req, res) => {
  try {
    const { queueId, token } = req.body;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    const item = queue.waitingList.find((i) => i.token === token);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    item.status = 'skipped';
    queue.totalSkipped += 1;
    await queue.save();

    return res.status(200).json({
      success: true,
      message: `Token ${token} skipped`,
      data: queue,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add appointment to queue ─────────────────────────────────
export const addToQueue = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('department');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const today = new Date(getISTDateString());
    let queue = await Queue.findOne({
      department: appointment.department._id,
      date: {
        $gte: new Date(today).setHours(0, 0, 0, 0),
        $lte: new Date(today).setHours(23, 59, 59, 999),
      },
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'No queue found for today',
      });
    }

    // Check if already in queue
    const alreadyIn = queue.waitingList.find(
      (item) => item.appointment?.toString() === appointmentId
    );

    if (alreadyIn) {
      return res.status(400).json({
        success: false,
        message: 'Already in queue',
      });
    }

    queue.waitingList.push({
      appointment:  appointmentId,
      token:        appointment.queueToken,
      tokenNumber:  appointment.queueNumber,
      status:       'waiting',
    });

    await queue.save();

    return res.status(200).json({
      success: true,
      message: 'Added to queue',
      data: queue,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Close / Reset queue ──────────────────────────────────────
export const resetQueue = async (req, res) => {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    queue.currentToken  = null;
    queue.currentNumber = 0;
    queue.isOpen        = false;
    await queue.save();

    return res.status(200).json({
      success: true,
      message: 'Queue closed for today',
      data: queue,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
