// frontend/src/pages/customer/BookAppointment.jsx

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";

const STEPS = ["Department", "Service", "Date & Time", "Confirm"];

const BookAppointment = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const [selected, setSelected] = useState({
    department: null,
    service: null,
    date: "",
    slot: null,
    notes: "",
  });

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/departments?isActive=true");
        setDepartments(data.data);
      } catch {
        toast.error("Failed to load departments");
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  // Fetch services when department selected
  useEffect(() => {
    if (!selected.department) return;
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/services?department=${selected.department._id}&isActive=true`,
        );
        setServices(data.data);
      } catch {
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selected.department]);

  // Fetch slots when service and date selected
  useEffect(() => {
    if (!selected.service || !selected.date) return;
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/appointments/slots?serviceId=${selected.service._id}&date=${selected.date}`,
        );
        setSlots(data.data);
      } catch {
        toast.error("Failed to load time slots");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selected.service, selected.date]);

  const handleBook = async () => {
    setBooking(true);
    try {
      const { data } = await api.post("/appointments", {
        departmentId: selected.department._id,
        serviceId: selected.service._id,
        date: selected.date,
        timeSlot: selected.slot,
        notes: selected.notes,
      });
      setConfirmed(data.data);
      setStep(4); // Success screen
      toast.success("Appointment booked successfully!");
    } catch (error) {
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        toast.error("Please verify your email first — check your inbox or resend from your dashboard.");
      } else {
        toast.error(error.response?.data?.message || "Booking failed");
      }
    } finally {
      setBooking(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!selected.department;
    if (step === 1) return !!selected.service;
    if (step === 2) return !!selected.date && !!selected.slot;
    return true;
  };

  // ── Success screen ──────────────────────────────────────────
  if (step === 4 && confirmed) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dash-card p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-slate-500 mb-8">
            Your appointment has been booked successfully.
          </p>

          {/* Token */}
          <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6 mb-6">
            <p className="text-sm text-slate-500 mb-2">Your Queue Token</p>
            <p className="text-5xl font-bold text-primary-600 font-mono mb-2">
              {confirmed.queueToken}
            </p>
            <p className="text-xs text-slate-400">Keep this token handy</p>
          </div>

          {/* Details */}
          <div className="text-left space-y-3 mb-8">
            {[
              { label: "Booking Ref", value: confirmed.bookingReference },
              { label: "Department", value: confirmed.department?.name },
              { label: "Service", value: confirmed.service?.name },
              {
                label: "Date",
                value: new Date(confirmed.date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
              {
                label: "Time",
                value: `${confirmed.timeSlot?.start} – ${confirmed.timeSlot?.end}`,
              },
              {
                label: "Fee",
                value: confirmed.fee > 0 ? `₹${confirmed.fee}` : "Free",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/my-appointments")}
              className="btn-secondary flex-1"
            >
              My Bookings
            </button>
            <button
              onClick={() => navigate("/live-queue")}
              className="btn-primary flex-1"
            >
              <Zap size={16} /> Live Queue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Book Appointment</h2>
        <p className="text-slate-500 text-sm mt-1">
          Follow the steps to book your appointment
        </p>
      </div>

      {/* Step indicator */}
      <div className="dash-card p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span
                  className={`text-xs mt-1 font-medium hidden sm:block ${
                    i === step ? "text-primary-600" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    i < step ? "bg-green-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="dash-card p-6">
        <AnimatePresence mode="wait">
          {/* Step 0 — Select Department */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-primary-500" />
                Select Department
              </h3>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {departments.map((dept) => (
                    <button
                      key={dept._id}
                      onClick={() =>
                        setSelected({
                          ...selected,
                          department: dept,
                          service: null,
                          slot: null,
                        })
                      }
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selected.department?._id === dept._id
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-100 hover:border-primary-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: dept.color + "20" }}
                        >
                          {dept.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {dept.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {dept.workingHours?.start} –{" "}
                            {dept.workingHours?.end}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1 — Select Service */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary-500" />
                Select Service
              </h3>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">
                    No services available for this department.
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Please contact admin.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <button
                      key={service._id}
                      onClick={() =>
                        setSelected({ ...selected, service, slot: null })
                      }
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        selected.service?._id === service._id
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-100 hover:border-primary-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {service.name}
                          </p>
                          {service.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="font-semibold text-primary-600">
                            {service.fee > 0 ? `₹${service.fee}` : "Free"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {service.duration} min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2 — Select Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary-500" />
                Select Date & Time
              </h3>

              {/* Date picker */}
              <DatePicker
                selected={selected.date ? new Date(selected.date) : null}
                onChange={(date) =>
                  setSelected((prev) => ({
                    ...prev,
                    date: date
                      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                      : "",
                  }))
                }
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select Appointment Date"
                className="form-input w-full"
                calendarClassName="slotly-calendar"
                popperPlacement="bottom-start"
              />

              {/* Time slots */}
              {selected.date && (
                <div>
                  <label className="form-label">
                    Available Time Slots
                    {loading && (
                      <Spinner size="sm" className="ml-2 inline-block" />
                    )}
                  </label>
                  {!loading && slots.length === 0 && (
                    <p className="text-slate-400 text-sm py-4">
                      No slots available for this date. Please try another date.
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slots.map((slot, i) => (
                      <button
                        key={i}
                        disabled={!slot.available}
                        onClick={() => setSelected({ ...selected, slot })}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          !slot.available
                            ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                            : selected.slot?.start === slot.start
                              ? "border-primary-500 bg-primary-50 text-primary-600"
                              : "border-slate-200 hover:border-primary-300 text-slate-700"
                        }`}
                      >
                        <Clock size={12} className="inline mr-1" />
                        {slot.start}
                        {!slot.available && (
                          <span className="block text-xs text-slate-300 mt-0.5">
                            Booked
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <CheckCircle size={20} className="text-primary-500" />
                Confirm Booking
              </h3>

              <div className="bg-slate-50 rounded-2xl p-5 space-y-3 mb-6">
                {[
                  { label: "Department", value: selected.department?.name },
                  { label: "Service", value: selected.service?.name },
                  {
                    label: "Duration",
                    value: `${selected.service?.duration} minutes`,
                  },
                  {
                    label: "Date",
                    value: new Date(selected.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  {
                    label: "Time",
                    value: `${selected.slot?.start} – ${selected.slot?.end}`,
                  },
                  {
                    label: "Fee",
                    value:
                      selected.service?.fee > 0
                        ? `₹${selected.service.fee}`
                        : "Free",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="form-label">
                  Additional Notes (optional)
                </label>
                <textarea
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Any special requirements or medical history..."
                  value={selected.notes}
                  onChange={(e) =>
                    setSelected({ ...selected, notes: e.target.value })
                  }
                />
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-700">
                <strong>Note:</strong> A queue token will be assigned
                automatically after booking. Please arrive 10 minutes before
                your scheduled time.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() =>
            step > 0 ? setStep(step - 1) : navigate("/dashboard")
          }
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          {step === 0 ? "Cancel" : "Back"}
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleBook}
            disabled={booking}
            className="btn-primary flex items-center gap-2"
          >
            {booking ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle size={16} /> Confirm Booking
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
