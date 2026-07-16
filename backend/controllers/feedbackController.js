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
    const { department, rating } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (rating) filter.rating = rating;

    const feedback = await Feedback.find(filter)
      .populate('user', 'name avatar')
      .populate('department', 'name icon')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    const avgRating = feedback.length
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      count: feedback.length,
      avgRating,
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompletedAppointmentsForFeedback = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.user._id,
      status: 'completed',
    }).populate('department', 'name icon').populate('service', 'name');

    const feedbackGiven = await Feedback.find({ user: req.user._id }).select('appointment');
    const givenIds = feedbackGiven.map((f) => f.appointment.toString());

    const pending = appointments.filter((a) => !givenIds.includes(a._id.toString()));

    return res.status(200).json({ success: true, data: pending });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};