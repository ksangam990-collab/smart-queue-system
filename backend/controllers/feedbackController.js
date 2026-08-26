import Feedback from '../models/Feedback.js';
import Appointment from '../models/Appointment.js';

export const createFeedback = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.user._id,
      status: 'completed',
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Completed appointment not found',
      });
    }

    const existing = await Feedback.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this appointment',
      });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      appointment: appointmentId,
      department: appointment.department,
      service: appointment.service,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate('department', 'name icon')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const { department, rating, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (rating)     filter.rating     = Number(rating);

    const [total, feedback, ratingAgg] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter)
        .populate('user', 'name avatar')
        .populate('department', 'name icon')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      // Compute average over ALL matching docs, not just this page
      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
    ]);

    const avgRating = ratingAgg[0] ? ratingAgg[0].avg.toFixed(1) : '0.0';

    return res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      pages: Math.ceil(total / limit),
      avgRating,
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompletedAppointmentsForFeedback = async (req, res) => {
  try {
    // Get IDs of appointments already reviewed in a single fast query
    const feedbackGiven = await Feedback.find({ user: req.user._id }).select('appointment');
    const givenIds = feedbackGiven.map((f) => f.appointment);

    // Fetch only the appointments not yet reviewed, with a sensible cap.
    // Without a limit this returns every completed appointment ever, which
    // grows unboundedly and can OOM the server for active users.
    const pending = await Appointment.find({
      user: req.user._id,
      status: 'completed',
      _id: { $nin: givenIds },
    })
      .populate('department', 'name icon')
      .populate('service', 'name')
      .sort({ date: -1 })
      .limit(50);

    return res.status(200).json({ success: true, data: pending });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};