// backend/utils/queueAccess.js
//
// Shared authorization + queue-hygiene helpers used by the appointment and
// queue controllers.

import mongoose from 'mongoose';
import Queue from '../models/Queue.js';
import { emitQueueUpdate } from '../socket.js';

export const isValidId = (v) => typeof v === 'string' && mongoose.isValidObjectId(v);

// Admins may act on any department. Staff may act only on the department they
// are assigned to — and a staff account with NO department gets no access
// (secure default) instead of silently seeing everything.
export const canAccessDepartment = (user, departmentId) => {
  if (!user || !departmentId) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'staff') {
    return !!user.department && user.department.toString() === departmentId.toString();
  }
  return false;
};

export const NO_DEPARTMENT_MESSAGE =
  'Your staff account is not assigned to a department. Please contact an administrator.';

// Remove an appointment from every queue that still lists it (cancel, no-show,
// reschedule). Matching on the appointment id — rather than department + exact
// date — is what makes this reliable; the old date-equality $pull never matched
// because the queue's date is start-of-day while the appointment's is not.
export const removeAppointmentFromQueues = async (appointmentId) => {
  const queues = await Queue.find({ 'waitingList.appointment': appointmentId });

  for (const q of queues) {
    await Queue.updateOne(
      { _id: q._id },
      { $pull: { waitingList: { appointment: appointmentId } } }
    );

    emitQueueUpdate(q.department.toString(), {
      currentToken:  q.currentToken,
      currentNumber: q.currentNumber,
      totalServed:   q.totalServed,
      waitingCount:  q.waitingList.filter(
        (i) => i.status === 'waiting' && i.appointment?.toString() !== appointmentId.toString()
      ).length,
    });
  }
};
