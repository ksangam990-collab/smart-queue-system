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
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import MagneticButton from "../../components/home/MagneticButton";

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
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="relative w-20 h-20 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <span className="absolute inset-0 rounded-full border-2 border-accent-400 animate-pulse-soft" />
            <CheckCircle size={40} className="text-accent-500" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-2xl font-bold text-slate-800 mb-2"
          >
            Booking Confirmed!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 mb-8"
          >
            Your appointment has been booked successfully.
          </motion.p>

          {/* Token */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6 mb-6"
          >
            <p className="text-sm text-slate-500 mb-2">Your Queue Token</p>
            <p className="text-5xl font-bold text-primary-600 font-mono mb-2">
              {confirmed.queueToken}
            </p>
            <p className="text-xs text-slate-400">Keep this token handy</p>
          </motion.div>

          {/* Details */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.45 } },
            }}
            className="text-left space-y-3 mb-8"
          >
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
              <motion.div
                key={label}
                variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                className="flex justify-between text-sm"
              >
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex gap-3"
          >
            <button
              onClick={() => navigate("/my-appointments")}
              data-cursor="hover"
              className="btn-secondary flex-1"
            >
              My Bookings
            </button>
            <MagneticButton className="flex-1" strength={0.15}>
              <button
                onClick={() => navigate("/live-queue")}
                data-cursor="hover"
                className="btn-primary w-full"
              >
                <Zap size={16} /> Live Queue
              </button>
            </MagneticButton>
          </motion.div>
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
                <motion.div
                  animate={{ scale: i === step ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                    i < step
                      ? "bg-accent-500 text-white"
                      : i === step
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </motion.div>
                <span
                  className={`text-xs mt-1 font-medium hidden sm:block ${
                    i === step ? "text-primary-600" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-slate-200 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-accent-500"
                    initial={false}
                    animate={{ width: i < step ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
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
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {departments.map((dept) => (
                    <motion.button
                      key={dept._id}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() =>
                        setSelected({
                          ...selected,
                          department: dept,
                          service: null,
                          slot: null,
                        })
                      }
                      className={`p-4 rounded-2xl border-2 text-left transition-colors duration-200 ${
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
                    </motion.button>
                  ))}
                </motion.div>
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
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                  className="space-y-3"
                >
                  {services.map((service) => (
                    <motion.button
                      key={service._id}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() =>
                        setSelected({ ...selected, service, slot: null })
                      }
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-colors duration-200 ${
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
                    </motion.button>
                  ))}
                </motion.div>
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
          data-cursor="hover"
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          {step === 0 ? "Cancel" : "Back"}
        </button>

        {step < 3 ? (
          <MagneticButton strength={0.15}>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              data-cursor="hover"
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          </MagneticButton>
        ) : (
          <MagneticButton strength={0.15}>
            <button
              onClick={handleBook}
              disabled={booking}
              data-cursor="hover"
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
          </MagneticButton>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
