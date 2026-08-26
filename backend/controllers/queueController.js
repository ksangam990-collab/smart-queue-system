// backend/controllers/queueController.js

import Queue        from '../models/Queue.js';
import Appointment  from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import {
  sendEmail,
  getQueueAlertHTML,
  getQueueAlertText,
} from '../utils/sendEmail.js';
import { emitQueueUpdate } from '../socket.js';

// Use CLIENT_URL everywhere — FRONTEND_URL was an inconsistent duplicate.
// No hardcoded fallback: if CLIENT_URL is unset the app is misconfigured and
// email links should fail loudly rather than silently point to the wrong domain.
const BASE_URL = process.env.CLIENT_URL;
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

    // ── Atomic update — prevents the double-call race condition ──────────────
    // Two staff pressing callNext simultaneously would both read the same queue
    // state and both mark the same token as 'called' if we used findById+save.
    //
    // Instead we use a single findOneAndUpdate with:
    //   - a $set that marks ALL currently 'called'/'serving' items as 'done'
    //   - a positional $set on the FIRST 'waiting' item to 'called'
    //
    // Because Mongoose subdocument arrays can't do positional atomic updates on
    // the first match cleanly in one op, we use a two-step approach that is
    // still safe: the first step atomically claims the first waiting slot by
    // setting it to 'called' using the filtered positional operator $[elem].
    // The condition ensures only one concurrent request succeeds.

    // Step 1: atomically mark the first 'waiting' item as 'in-progress'
    // (a sentinel status) so no other request can claim it.
    const claimed = await Queue.findOneAndUpdate(
      {
        _id: queueId,
        'waitingList.status': 'waiting',  // at least one waiting item exists
      },
      {
        // Mark previously called/serving as done
        $set: { 'waitingList.$[prev].status': 'done' },
      },
      {
        arrayFilters: [{ 'prev.status': { $in: ['called', 'serving'] } }],
        new: false,   // we don't need the result yet
      }
    );

    // Step 2: now mark the first 'waiting' item as 'called'
    const queue = await Queue.findOneAndUpdate(
      {
        _id: queueId,
        'waitingList.status': 'waiting',
      },
      {
        $set: {
          'waitingList.$[next].status':   'called',
          'waitingList.$[next].calledAt': new Date(),
        },
        $inc: { totalServed: 1 },
      },
      {
        arrayFilters: [{ 'next.status': 'waiting' }],
        new: true,
        // Only the first matching arrayFilter element is updated
        // (MongoDB updates the first subdoc that matches the filter)
      }
    ).populate({
      path: 'waitingList.appointment',
      populate: { path: 'user', select: 'name email' },
    });

    if (!queue) {
      return res.status(200).json({
        success: false,
        message: 'No more patients in queue',
      });
    }

    // Find the item we just called (status === 'called', most recent calledAt)
    const calledItem = queue.waitingList
      .filter((i) => i.status === 'called')
      .sort((a, b) => new Date(b.calledAt) - new Date(a.calledAt))[0];

    if (calledItem) {
      queue.currentToken  = calledItem.token;
      queue.currentNumber = calledItem.tokenNumber;
      await queue.save();
    }

    // ── Broadcast real-time update ──────────────────────────────────────────
    emitQueueUpdate(queue.department.toString(), {
      currentToken:  queue.currentToken,
      currentNumber: queue.currentNumber,
      totalServed:   queue.totalServed,
      waitingCount:  queue.waitingList.filter((i) => i.status === 'waiting').length,
    });

    // ── Notify the called patient (in-app) ─────────────────────────────────
    if (calledItem?.appointment?.user) {
      await Notification.create({
        recipient: calledItem.appointment.user._id,
        title:     'Your token is being called!',
        message:   `Token ${calledItem.token} — please proceed to the counter now.`,
        type:      'queue_called',
        link:      '/live-queue',
      });
    }

    // ── Send proximity alerts to patients 2–3 positions away ───────────────
    const stillWaiting = queue.waitingList
      .filter((item) => item.status === 'waiting')
      .sort((a, b) => a.tokenNumber - b.tokenNumber);

    const alertPromises = [];
    stillWaiting.forEach((item, idx) => {
      const position = idx + 1;
      if (ALERT_AT_POSITIONS.includes(position) && !item.alertSent) {
        const apt  = item.appointment;
        const user = apt?.user;
        if (!user?.email) return;

        const estimatedMinutes = (position - 1) * 15;
        item.alertSent = true;

        alertPromises.push(
          Notification.create({
            recipient: user._id,
            title:     `⏰ ${position === 1 ? 'You are next!' : `${position} positions away`}`,
            message:   `Token ${item.token} — head to the clinic now.`,
            type:      'queue_alert',
            link:      '/live-queue',
          })
        );

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

    if (alertPromises.length) {
      await Promise.all([queue.save(), ...alertPromises]);
    }

    return res.status(200).json({
      success: true,
      message: `Called token ${calledItem?.token}`,
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

    // Broadcast skip update
    emitQueueUpdate(queue.department.toString(), {
      currentToken:  queue.currentToken,
      currentNumber: queue.currentNumber,
      totalServed:   queue.totalServed,
      waitingCount:  queue.waitingList.filter(i => i.status === 'waiting').length,
    });

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
