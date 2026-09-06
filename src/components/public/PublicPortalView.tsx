import React, { useState, useEffect } from "react";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  MessageCircle,
  CheckCircle2,
  Share2,
  Copy,
  CreditCard,
  DollarSign,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Grid,
  LayoutGrid,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  Wifi,
  Car,
  Coffee,
  CalendarPlus,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Smartphone,
  Building2,
  FileText,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  LogIn,
  LogOut,
  UserCheck,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Court, Booking } from "../../types";
import { copyToClipboard, slugify } from "../../lib/slugify";
import { SharePortalModal } from "../common/SharePortalModal";
import { CustomerAuthModal, PortalUser } from "./CustomerAuthModal";
import {
  cleanPhoneForWhatsApp,
  createWhatsAppDepositReceiptLink,
  createWhatsAppModificationNoticeToAdminLink,
  createWhatsAppModificationNoticeToCustomerLink,
  createWhatsAppCancellationNoticeToAdminLink,
  createWhatsAppCancellationNoticeToCustomerLink,
} from "../../lib/whatsapp";

interface PublicPortalViewProps {
  isStandalone?: boolean;
  onReturnToAdmin?: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  isStandalone = false,
  onReturnToAdmin,
}) => {
  const {
    courts,
    bookings,
    settings,
    customers,
    license,
    isLicenseActive,
    isSuperAdmin,
    activateLicense30Days,
    activeComplex,
    addBooking,
    addCustomer,
    updateBooking,
    cancelBooking,
    checkCourtAvailability,
    getPublicPortalUrl,
    formatPrice,
  } = useApp();

  const formatClientPrice = (amount: number) => formatPrice(amount, "client");

  // Booking Flow Steps: 1 = Court & Date Selection, 2 = Slot Selection, 3 = Customer Info & Payment, 4 = Confirmation Ticket
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // User Auth State for Public Portal
  const [portalUser, setPortalUser] = useState<PortalUser | null>(() => {
    try {
      const stored = localStorage.getItem("portal_active_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showMandatoryAuthNotice, setShowMandatoryAuthNotice] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLoginSuccess = (user: PortalUser) => {
    setPortalUser(user);
    try {
      localStorage.setItem("portal_active_user", JSON.stringify(user));
    } catch {
      // ignore
    }
    if (user.name) setCustomerName(user.name);
    if (user.phone) setCustomerPhone(user.phone);
    if (user.email) setCustomerEmail(user.email);

    if (selectedCourt && selectedStartTime && step < 3) {
      setStep(3);
    }
  };

  const handleLogout = () => {
    setPortalUser(null);
    try {
      localStorage.removeItem("portal_active_user");
    } catch {
      // ignore
    }
    setShowUserDropdown(false);
  };

  // Sync user info into form fields when user logs in or mounts
  useEffect(() => {
    if (portalUser) {
      if (!customerName) setCustomerName(portalUser.name || "");
      if (!customerPhone) setCustomerPhone(portalUser.phone || "");
      if (!customerEmail) setCustomerEmail(portalUser.email || "");
    }
  }, [portalUser]);

  // Filters
  const [selectedSport, setSelectedSport] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [portalViewMode, setPortalViewMode] = useState<"GRID" | "CARDS">(
    "CARDS",
  );
  const [showCustomDatePicker, setShowCustomDatePicker] =
    useState<boolean>(false);

  // Carousel State & Logic
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState<boolean>(false);

  const carouselImagesList = React.useMemo(() => {
    if (settings.carouselImages && settings.carouselImages.length > 0) {
      return settings.carouselImages;
    }
    return [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
    ];
  }, [settings.carouselImages]);

  useEffect(() => {
    if (
      settings.showCarousel === false ||
      carouselImagesList.length <= 1 ||
      isCarouselHovered
    )
      return;

    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImagesList.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [settings.showCarousel, carouselImagesList.length, isCarouselHovered]);

  const mapsTargetUrl = React.useMemo(() => {
    let rawUrl = "";
    if (settings.googleMapsUrl && settings.googleMapsUrl.trim()) {
      rawUrl = settings.googleMapsUrl.trim();
    } else if (settings.address && settings.address.trim()) {
      rawUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address.trim())}`;
    } else {
      rawUrl = "https://maps.google.com/?q=-34.5453,-58.4497";
    }

    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }
    return `https://${rawUrl}`;
  }, [settings.googleMapsUrl, settings.address]);

  // Helper to generate next 14 days for quick interactive calendar selection
  const daysList = React.useMemo(() => {
    const days = [];
    const today = new Date();
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayNum = String(d.getDate()).padStart(2, "0");
      const dayLabel =
        i === 0 ? "Hoy" : i === 1 ? "Mañana" : dayNames[d.getDay()];
      const monthLabel = monthNames[d.getMonth()];

      days.push({
        dateStr,
        dayLabel,
        dayNum,
        monthLabel,
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Selected Booking Details - MINIMUM DURATION IS 60 MINUTES (1 HOUR)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);

  // Dynamic branding colors from current complex settings
  const primaryColor = settings.primaryColor || "#059669";
  const secondaryColor = settings.secondaryColor || primaryColor;

  // Keep selectedCourt in sync with live courts context
  useEffect(() => {
    if (selectedCourt) {
      const updated = courts.find((c) => c.id === selectedCourt.id);
      if (updated) {
        setSelectedCourt(updated);
      }
    }
  }, [courts]);

  // Customer Form State
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "MERCADO_PAGO" | "TRANSFER" | "CASH"
  >("TRANSFER");
  const [notes, setNotes] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  // Copy Feedback for Bank Info & MP Info
  const [copiedCbu, setCopiedCbu] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedMpAlias, setCopiedMpAlias] = useState(false);
  const [copiedMpCvu, setCopiedMpCvu] = useState(false);

  // Completed Booking Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWifiPass, setCopiedWifiPass] = useState(false);
  const [showServicesCard, setShowServicesCard] = useState(false);

  const handleCopyWifi = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedWifiPass(true);
    setTimeout(() => setCopiedWifiPass(false), 2500);
  };
  const [activeTab, setActiveTab] = useState<"NEW_BOOKING" | "MY_BOOKINGS">(
    "NEW_BOOKING",
  );

  // Lookup existing bookings for a customer phone
  const [lookupPhone, setLookupPhone] = useState("");
  const [searchedBookings, setSearchedBookings] = useState<Booking[] | null>(
    null,
  );

  // Cancel booking modal state
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [lastCancelledNoticeData, setLastCancelledNoticeData] = useState<{
    bookingId: string;
    customerName: string;
    customerPhone: string;
    courtName: string;
    date: string;
    startTime: string;
    reason?: string;
  } | null>(null);

  // Edit booking modal state
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [editCourtId, setEditCourtId] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editStartTime, setEditStartTime] = useState<string>("");
  const [editDurationMinutes, setEditDurationMinutes] = useState<number>(60);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editError, setEditError] = useState<string>("");
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [lastEditedNoticeData, setLastEditedNoticeData] = useState<{
    bookingId: string;
    customerName: string;
    customerPhone: string;
    customerWhatsApp?: string;
    courtName: string;
    courtTypeName?: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    totalPrice: number;
    notes?: string;
  } | null>(null);

  // Keep searchedBookings in sync when global bookings state changes
  useEffect(() => {
    if (lookupPhone.trim()) {
      const cleaned = lookupPhone.trim().replace(/\D/g, "");
      const found = bookings.filter((b) =>
        b.customerPhone.replace(/\D/g, "").includes(cleaned),
      );
      setSearchedBookings(found);
    }
  }, [bookings, lookupPhone]);

  // Available sports list derived from courts
  const sports = Array.from(new Set(courts.map((c) => c.typeName)));

  // Filtered active courts
  const activeCourts = courts.filter((c) => {
    if (!c.isActive) return false;
    if (selectedSport !== "ALL" && c.typeName !== selectedSport) return false;
    return true;
  });

  // Calculate price for selected court, date, duration and time
  const calculatePrice = (
    court: Court,
    dateStr: string,
    timeStr: string,
    duration: number,
  ) => {
    const isWeekend =
      new Date(dateStr + "T00:00:00").getDay() === 0 ||
      new Date(dateStr + "T00:00:00").getDay() === 6;
    const hour = parseInt(timeStr.split(":")[0] || "12", 10);
    const isNight = hour >= 20;

    let basePrice = (court.pricePerHour * duration) / 60;
    if (isWeekend && court.weekendSurchargePercent > 0) {
      basePrice += basePrice * (court.weekendSurchargePercent / 100);
    }
    if (isNight && court.nightSurchargeAmount > 0) {
      basePrice += (court.nightSurchargeAmount * duration) / 60;
    }
    return Math.round(basePrice);
  };

  // Generate available time slots for a court on selected date (Minimum 1 hour / 60 min slots)
  const getAvailableSlots = (
    court: Court,
    dateStr: string,
    duration: number,
  ) => {
    const slots: {
      time: string;
      isAvailable: boolean;
      price: number;
      reason?: string;
    }[] = [];
    const openHour = parseInt(court.openingTime.split(":")[0] || "8", 10);
    let closeHour = parseInt(court.closingTime.split(":")[0] || "23", 10);
    if (closeHour <= openHour) {
      closeHour = 24;
    }

    const now = new Date();
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (let h = openHour; h < closeHour; h++) {
      const timeStr = `${h.toString().padStart(2, "0")}:00`;
      const slotStartMins = h * 60;

      let isAvailable = true;
      let conflictReason = "";

      // Past time check for today
      if (dateStr === todayStr && slotStartMins < currentMins) {
        isAvailable = false;
        conflictReason = "Pasado";
      } else {
        const check = checkCourtAvailability(
          court.id,
          dateStr,
          timeStr,
          duration,
        );
        if (!check.available) {
          isAvailable = false;
          conflictReason = check.conflictReason?.includes("mantenimiento")
            ? "Mantenimiento"
            : check.conflictReason?.includes("atención")
              ? "Cerrado"
              : "Reservado";
        }
      }

      const price = calculatePrice(court, dateStr, timeStr, duration);
      slots.push({ time: timeStr, isAvailable, price, reason: conflictReason });
    }

    return slots;
  };

  // Generate available time slots for edit modal (excluding conflict with editing booking)
  const getAvailableSlotsForEdit = (
    court: Court,
    dateStr: string,
    duration: number,
    excludeBookingId: string,
  ) => {
    const slots: {
      time: string;
      isAvailable: boolean;
      price: number;
      reason?: string;
    }[] = [];
    const openHour = parseInt(court.openingTime.split(":")[0] || "8", 10);
    let closeHour = parseInt(court.closingTime.split(":")[0] || "23", 10);
    if (closeHour <= openHour) {
      closeHour = 24;
    }

    for (let h = openHour; h < closeHour; h++) {
      const timeStr = `${h.toString().padStart(2, "0")}:00`;

      const check = checkCourtAvailability(
        court.id,
        dateStr,
        timeStr,
        duration,
        excludeBookingId,
      );

      let isAvailable = check.available;
      let conflictReason = check.available
        ? ""
        : check.conflictReason?.includes("mantenimiento")
          ? "Mantenimiento"
          : "Reservado";

      const price = calculatePrice(court, dateStr, timeStr, duration);
      slots.push({ time: timeStr, isAvailable, price, reason: conflictReason });
    }

    return slots;
  };

  const handleStartEditBooking = (b: Booking) => {
    setBookingToEdit(b);
    setEditCourtId(b.courtId);
    setEditDate(b.date);
    setEditStartTime(b.startTime);
    setEditDurationMinutes(b.durationMinutes || 60);
    setEditNotes(b.notes || "");
    setEditError("");
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingToEdit) return;

    if (!editStartTime) {
      setEditError("Por favor seleccioná un horario disponible.");
      return;
    }

    const selectedEditCourt = courts.find((c) => c.id === editCourtId);
    if (!selectedEditCourt) {
      setEditError("Cancha no encontrada.");
      return;
    }

    const availability = checkCourtAvailability(
      editCourtId,
      editDate,
      editStartTime,
      editDurationMinutes,
      bookingToEdit.id,
    );
    if (!availability.available) {
      setEditError(
        availability.conflictReason ||
          "El horario seleccionado no está disponible.",
      );
      return;
    }

    const startMins =
      parseInt(editStartTime.split(":")[0], 10) * 60 +
      parseInt(editStartTime.split(":")[1] || "0", 10);
    const endMins = startMins + editDurationMinutes;
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;
    const newEndTime = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;

    const newTotalPrice = calculatePrice(
      selectedEditCourt,
      editDate,
      editStartTime,
      editDurationMinutes,
    );

    updateBooking(bookingToEdit.id, {
      courtId: editCourtId,
      date: editDate,
      startTime: editStartTime,
      endTime: newEndTime,
      durationMinutes: editDurationMinutes,
      totalPrice: newTotalPrice,
      notes: editNotes.trim() ? editNotes.trim() : undefined,
    });

    setLastEditedNoticeData({
      bookingId: bookingToEdit.id,
      customerName: bookingToEdit.customerName,
      customerPhone: bookingToEdit.customerPhone,
      customerWhatsApp: bookingToEdit.customerWhatsApp,
      courtName: selectedEditCourt.name,
      courtTypeName: selectedEditCourt.typeName,
      date: editDate,
      startTime: editStartTime,
      endTime: newEndTime,
      durationMinutes: editDurationMinutes,
      totalPrice: newTotalPrice,
      notes: editNotes.trim() ? editNotes.trim() : undefined,
    });

    setEditSuccessMsg(
      `La reserva #${bookingToEdit.id} fue actualizada correctamente.`,
    );
    setBookingToEdit(null);
    setEditError("");
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingToCancel) return;

    const reason = cancellationReason.trim()
      ? `Cancelada por el cliente desde el portal web. Motivo: ${cancellationReason.trim()}`
      : "Cancelada por el cliente desde el portal web.";

    const courtObj = courts.find((c) => c.id === bookingToCancel.courtId);

    cancelBooking(bookingToCancel.id, reason);

    setLastCancelledNoticeData({
      bookingId: bookingToCancel.id,
      customerName: bookingToCancel.customerName,
      customerPhone: bookingToCancel.customerPhone,
      courtName: courtObj?.name || "Cancha",
      date: bookingToCancel.date,
      startTime: bookingToCancel.startTime,
      reason: cancellationReason.trim() || undefined,
    });

    setCancelSuccessMsg(
      `La reserva #${bookingToCancel.id} fue cancelada exitosamente.`,
    );
    setBookingToCancel(null);
    setCancellationReason("");
  };

  const handleSelectSlot = (court: Court, timeStr: string) => {
    setSelectedCourt(court);
    setSelectedStartTime(timeStr);
    setSubmitError("");

    if (!portalUser) {
      setShowMandatoryAuthNotice(true);
      return;
    }

    setStep(3); // Move to Customer Info & Payment
  };

  const handleCopyBankField = (text: string, type: "cbu" | "alias") => {
    navigator.clipboard.writeText(text);
    if (type === "cbu") {
      setCopiedCbu(true);
      setTimeout(() => setCopiedCbu(false), 2000);
    } else {
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    }
  };

  const handleCopyMpField = (text: string, type: "mpAlias" | "mpCvu") => {
    navigator.clipboard.writeText(text);
    if (type === "mpAlias") {
      setCopiedMpAlias(true);
      setTimeout(() => setCopiedMpAlias(false), 2000);
    } else {
      setCopiedMpCvu(true);
      setTimeout(() => setCopiedMpCvu(false), 2000);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!isLicenseActive) {
      setSubmitError(
        `El sistema de reservas automáticas online para ${settings.complexName || "este complejo"} se encuentra temporalmente pausado por actualización administrativa. Por favor, comuníquese directamente por WhatsApp al ${settings.whatsapp || settings.phone || "complejo"} para confirmar su turno.`
      );
      return;
    }

    if (!portalUser) {
      setShowMandatoryAuthNotice(true);
      return;
    }

    if (!selectedCourt || !selectedStartTime) {
      setSubmitError("Por favor seleccioná una cancha y un horario válido.");
      return;
    }

    if (!customerName.trim()) {
      setSubmitError("Por favor ingresá tu Nombre y Apellido.");
      return;
    }

    if (!customerPhone.trim()) {
      setSubmitError("Por favor ingresá tu número de Teléfono / WhatsApp.");
      return;
    }

    // Minimum booking duration is 60 minutes
    const finalDuration = Math.max(60, durationMinutes || 60);

    // Verify availability right before confirming reservation
    const availabilityCheck = checkCourtAvailability(
      selectedCourt.id,
      selectedDate,
      selectedStartTime,
      finalDuration,
    );
    if (!availabilityCheck.available) {
      setSubmitError(
        availabilityCheck.conflictReason ||
          "El turno seleccionado ya fue reservado por otro usuario. Por favor elegí otro horario o cancha.",
      );
      return;
    }

    const [startH, startM] = selectedStartTime.split(":").map(Number);
    const startTotalMins = (startH || 0) * 60 + (startM || 0);
    const endTotalMins = startTotalMins + finalDuration;
    const endH = Math.floor(endTotalMins / 60) % 24;
    const endM = endTotalMins % 60;
    const endTimeStr = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;

    const totalPrice = calculatePrice(
      selectedCourt,
      selectedDate,
      selectedStartTime,
      finalDuration,
    );
    const depositAmount = Math.round(
      totalPrice * ((settings.depositPercentage || 50) / 100),
    );

    try {
      // Find or create customer in context
      let existingCust = customers.find(
        (c) =>
          c.phone &&
          c.phone
            .replace(/\D/g, "")
            .includes(customerPhone.trim().replace(/\D/g, "")),
      );
      let custId = existingCust?.id;
      if (!custId) {
        const nameParts = customerName.trim().split(" ");
        const firstName = nameParts[0] || customerName.trim();
        const lastName = nameParts.slice(1).join(" ") || "";
        const newCust = addCustomer({
          firstName,
          lastName,
          phone: customerPhone.trim(),
          whatsapp: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
          notes: "Registrado desde Portal Web",
        });
        custId = newCust.id;
      }

      const res = addBooking({
        courtId: selectedCourt.id,
        customerId: custId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerWhatsApp: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        date: selectedDate,
        startTime: selectedStartTime,
        durationMinutes: finalDuration,
        status: paymentMethod === "MERCADO_PAGO" ? "CONFIRMED" : "RESERVED",
        notes: notes.trim()
          ? `Reserva Online: ${notes.trim()}`
          : "Reserva realizada desde Portal Web del Jugador",
        createdBy: "Portal Web Público",
        paymentStatus:
          paymentMethod === "MERCADO_PAGO"
            ? "PAID"
            : paymentMethod === "TRANSFER"
              ? "DEPOSIT"
              : "PENDING",
        paymentMethod: paymentMethod,
        paidAmount: depositAmount,
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setStep(4); // Move to Confirmation Voucher
      } else {
        setSubmitError(
          res.message ||
            "Ocurrió un error al procesar la reserva. Por favor reintentá.",
        );
      }
    } catch (err) {
      console.error("Error in handleConfirmBooking:", err);
      setSubmitError(
        "Ocurrió un error al procesar la reserva. Por favor reintentá.",
      );
    }
  };

  const handleCopyPublicLink = async () => {
    await copyToClipboard(getPublicPortalUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSearchCustomerBookings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    const cleaned = lookupPhone.trim().replace(/\D/g, "");
    const found = bookings.filter((b) =>
      b.customerPhone.replace(/\D/g, "").includes(cleaned),
    );
    setSearchedBookings(found);
  };

  const bank = settings.bankDetails || {
    bankName: "Banco Galicia",
    accountHolder: settings.complexName || "Complejo Deportivo S.R.L.",
    cbuCvu: "0000003100087654321098",
    alias: "CANCHAS.RESERVAS.MP",
    cuitCuil: "30-71829384-9",
  };

  const mp = settings.mercadoPagoDetails || {
    accountHolder: settings.complexName || "Complejo Deportivo",
    mpAliasOrEmail: "complejo.mp",
    cvuMp: "0000003100099887766554",
    cuitCuilMp: "30-71829384-9",
    checkoutLinkMp: "",
    notesMp:
      "Transferir la seña al Alias de Mercado Pago y enviar el comprobante por WhatsApp.",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center space-x-2">
          {onReturnToAdmin && (
            <button
              type="button"
              onClick={onReturnToAdmin}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/20 shadow-xs cursor-pointer active:scale-95 mr-1"
              title="Volver a la gestión y panel de administración"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Admin</span>
            </button>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 font-extrabold">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Portal de Reservas para Clientes
          </span>
          <span className="text-slate-300 hidden md:inline font-medium">
            {isStandalone
              ? `Portal de reservas online 24/7 para ${settings.complexName}.`
              : `Vista previa interactiva del Portal de Reservas para Clientes de ${settings.complexName}.`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Share Portal Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Compartir enlace de reservas (WhatsApp, Redes, Copiar)"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Compartir</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/15 transition-all cursor-pointer active:scale-95"
            title="Copiar link oficial de reservas"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copiar Link</span>
              </>
            )}
          </button>
          {/* User Account Login Widget */}
          {portalUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="px-2.5 py-1 rounded-lg bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 border border-blue-400/40 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {portalUser.avatarUrl ? (
                  <img
                    src={portalUser.avatarUrl}
                    alt={portalUser.name}
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-blue-300" />
                )}
                <span className="truncate max-w-[110px] text-xs font-extrabold">
                  {portalUser.name}
                </span>
                <span className="text-[9px] bg-blue-400/30 px-1 py-0.2 rounded uppercase font-black tracking-wider text-blue-200">
                  {portalUser.provider}
                </span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2.5 z-50 text-slate-800 dark:text-slate-100 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        {portalUser.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {portalUser.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {portalUser.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("MY_BOOKINGS");
                      if (portalUser.phone) setLookupPhone(portalUser.phone);
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Mis Reservas ({portalUser.phone || "Sin tel."})</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión / Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Complex Branding Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.complexName}
                style={{ borderColor: primaryColor }}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-lg shrink-0 bg-white dark:bg-slate-800"
              />
            ) : (
              <div
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 25px -5px ${primaryColor}40`,
                }}
                className="w-16 h-16 rounded-2xl text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0"
              >
                {settings.complexName
                  ? settings.complexName.substring(0, 2).toUpperCase()
                  : "CD"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {settings.complexName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                {(settings.whatsapp || settings.phone) && (
                  <a
                    href={
                      cleanPhoneForWhatsApp(settings.whatsapp || settings.phone)
                        ? `https://api.whatsapp.com/send?phone=${cleanPhoneForWhatsApp(settings.whatsapp || settings.phone)}&text=${encodeURIComponent(`Hola *${settings.complexName}*! 👋 Quisiera hacer una consulta sobre las canchas. 🏟️⚽🎾`)}`
                        : `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola *${settings.complexName}*! 👋 Quisiera hacer una consulta sobre las canchas. 🏟️⚽🎾`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm shadow-emerald-600/20 transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 border border-emerald-400/30"
                    title="Enviar mensaje por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-200 shrink-0 fill-current opacity-90" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                )}
                <a
                  href={mapsTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 4px 12px ${primaryColor}30`,
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:opacity-90 text-white font-extrabold text-xs transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 border border-white/20"
                  title="Ver ubicación en Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Ubicación</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Compartir link de reservas con amigos o clientes"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Notification Banner when Administrator is Blocked / Subscription Inactive */}
        {!isLicenseActive && (
          <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/40 p-5 sm:p-6 text-slate-900 dark:text-slate-100 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-200">
                    Aviso a los Clientes: Reservas Online Temporalmente Suspendidas
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    El sistema de reserva automática online de{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {settings.complexName || "este complejo"}
                    </strong>{" "}
                    se encuentra en proceso de mantenimiento / actualización de suscripción.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-amber-300/80 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  ¿Desea reservar una cancha o consultar turnos disponibles?
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Comuníquese directamente con la administración del complejo por WhatsApp o llamada para coordinar su horario al instante.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(settings.whatsapp || settings.phone) && (
                  <a
                    href={`https://api.whatsapp.com/send?phone=${cleanPhoneForWhatsApp(settings.whatsapp || settings.phone)}&text=${encodeURIComponent(
                      `Hola *${settings.complexName || "Complejo"}*! 👋 Deseo consultar disponibilidad y reservar una cancha. ⚽🎾`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer text-xs active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp del Complejo</span>
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar</span>
                  </a>
                )}
              </div>
            </div>

            {isSuperAdmin && (
              <div className="pt-3 border-t border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Modo Super Administrador Activo (Licencia Inactiva)</span>
                </span>
                <button
                  type="button"
                  onClick={() => activateLicense30Days()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Habilitar +30 Días para este Complejo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Interactive Image Carousel */}
        {settings.showCarousel !== false && carouselImagesList.length > 0 && (
          <div
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md bg-slate-950 group h-52 sm:h-64 md:h-80 transition-all"
          >
            {/* Slide Images */}
            {carouselImagesList.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === carouselIndex
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Instalación ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            ))}

            {/* Navigation Arrows */}
            {carouselImagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCarouselIndex(
                      (prev) =>
                        (prev - 1 + carouselImagesList.length) %
                        carouselImagesList.length,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                  title="Imagen Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCarouselIndex(
                      (prev) => (prev + 1) % carouselImagesList.length,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                  title="Siguiente Imagen"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Slide Indicators & Badge */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-bold text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Instalaciones del Complejo ({carouselIndex + 1}/
                  {carouselImagesList.length})
                </span>
              </div>

              {carouselImagesList.length > 1 && (
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                  {carouselImagesList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCarouselIndex(idx)}
                      className={`transition-all rounded-full cursor-pointer ${
                        idx === carouselIndex
                          ? "w-6 h-2 bg-blue-500 shadow-sm"
                          : "w-2 h-2 bg-white/50 hover:bg-white/80"
                      }`}
                      title={`Ir a imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section: Servicios, Wi-Fi, Bar & Reglamento del Complejo */}
        {settings.showPublicServices !== false &&
          (settings.showWifiSection !== false ||
            settings.showBarSection !== false ||
            settings.showRulesSection !== false) && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <button
                onClick={() => setShowServicesCard(!showServicesCard)}
                className="w-full p-4 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-800/80 dark:to-slate-900 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Información & Servicios del Complejo
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Hacé clic para ver detalles de los servicios, reglas y
                      datos del complejo
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 font-bold text-xs shrink-0">
                  {showServicesCard ? "Ocultar ▲" : "Ver Detalles ▼"}
                </span>
              </button>

              {showServicesCard && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                  {/* Wi-Fi Details Card */}
                  {settings.showWifiSection !== false && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-black text-xs">
                          <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Conexión Wi-Fi Gratis</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] font-bold">
                          Alta Velocidad
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-slate-600 dark:text-slate-300">
                          Red:{" "}
                          <strong>
                            {settings.wifiName || "Complejo_Invitados_5G"}
                          </strong>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 font-mono">
                          Clave:{" "}
                          <strong>
                            {settings.wifiPassword || "padelyfutbol2026"}
                          </strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopyWifi(
                            settings.wifiPassword || "padelyfutbol2026",
                          )
                        }
                        className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 hover:bg-blue-100/50 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        {copiedWifiPass ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>¡Clave Copiada!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-blue-600" />
                            <span>Copiar Contraseña Wi-Fi</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bar / Buffet Info Card */}
                  {settings.showBarSection !== false && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-black text-xs">
                        <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Buffet & Bar del Complejo</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {settings.barInfo ||
                          "Abierto todos los días. Ofrecemos minutas, pizzas, hamburguesas, cerveza tirada, bebidas frías e hidratación deportiva."}
                      </p>
                    </div>
                  )}

                  {/* Rules & Location Card */}
                  {settings.showRulesSection !== false && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2.5">
                      <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100 font-black text-xs">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Reglamento y Ubicación</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                        {settings.complexRules ||
                          "Tolerancia de 10 minutos por turno. Uso de calzado adecuado sin tapones metálicos. Cancelaciones con 24hs de anticipación."}
                      </p>

                      {settings.showGoogleMapsBtn !== false && (
                        <a
                          href={mapsTargetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-300" />
                          <span>Ubicación</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Tab Navigation: Reservar vs Mis Reservas */}
        <div className="flex bg-slate-200/80 dark:bg-slate-900 p-1 rounded-2xl max-w-xs mx-auto border border-slate-300/60 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("NEW_BOOKING")}
            style={
              activeTab === "NEW_BOOKING"
                ? {
                    color: primaryColor,
                  }
                : {}
            }
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "NEW_BOOKING"
                ? "bg-white dark:bg-slate-800 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Reservar Turno
          </button>
          <button
            onClick={() => setActiveTab("MY_BOOKINGS")}
            style={
              activeTab === "MY_BOOKINGS"
                ? {
                    color: primaryColor,
                  }
                : {}
            }
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "MY_BOOKINGS"
                ? "bg-white dark:bg-slate-800 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Buscar Mi Reserva
          </button>
        </div>

        {/* TAB 1: NEW BOOKING FLOW */}
        {activeTab === "NEW_BOOKING" && (
          <div className="space-y-6">
            {/* Steps Progress Indicator */}
            <div className="flex items-center justify-between max-w-xl mx-auto px-2">
              <div
                style={step >= 1 ? { color: primaryColor } : {}}
                className={`flex items-center gap-2 text-xs font-extrabold ${step >= 1 ? "" : "text-slate-400"}`}
              >
                <span
                  style={
                    step >= 1
                      ? {
                          backgroundColor: primaryColor,
                        }
                      : {}
                  }
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  1
                </span>
                <span>Cancha y Día</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-3" />
              <div
                style={step >= 3 ? { color: primaryColor } : {}}
                className={`flex items-center gap-2 text-xs font-extrabold ${step >= 3 ? "" : "text-slate-400"}`}
              >
                <span
                  style={
                    step >= 3
                      ? {
                          backgroundColor: primaryColor,
                        }
                      : {}
                  }
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? "text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  2
                </span>
                <span>Datos y Pago</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-3" />
              <div
                style={step === 4 ? { color: primaryColor } : {}}
                className={`flex items-center gap-2 text-xs font-extrabold ${step === 4 ? "" : "text-slate-400"}`}
              >
                <span
                  style={
                    step === 4
                      ? {
                          backgroundColor: primaryColor,
                        }
                      : {}
                  }
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 4 ? "text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  3
                </span>
                <span>Comprobante</span>
              </div>
            </div>

            {/* STEP 1 & 2: COURT, DATE & SLOT SELECTION */}
            {step <= 2 && (
              <div className="space-y-6">
                {/* 1. INTERACTIVE DATE SELECTION BAR & CALENDAR CAROUSEL */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        style={{ color: primaryColor }}
                        className="w-5 h-5"
                      />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Seleccioná el Día para Tu Reserva
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        setShowCustomDatePicker(!showCustomDatePicker)
                      }
                      style={{
                        color: primaryColor,
                        borderColor: `${primaryColor}40`,
                      }}
                      className="text-xs font-extrabold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {showCustomDatePicker
                          ? "Ocultar Calendario"
                          : "📅 Ver Más Fechas en Calendario"}
                      </span>
                    </button>
                  </div>

                  {/* Custom Date Input Picker (Expandable) */}
                  {showCustomDatePicker && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Elegir cualquier fecha futura:
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setShowCustomDatePicker(false);
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
                      />
                    </div>
                  )}

                  {/* 14-Day Visual Carousel Cards */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    {daysList.map((day) => {
                      const isSelected = selectedDate === day.dateStr;
                      return (
                        <button
                          key={day.dateStr}
                          onClick={() => setSelectedDate(day.dateStr)}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: primaryColor,
                                  borderColor: primaryColor,
                                  boxShadow: `0 8px 16px ${primaryColor}40`,
                                }
                              : {}
                          }
                          className={`shrink-0 flex flex-col items-center justify-center min-w-[72px] py-3 px-2 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "text-white scale-105 font-bold"
                              : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider ${isSelected ? "text-white/80" : "text-slate-400"}`}
                          >
                            {day.dayLabel}
                          </span>
                          <span className="text-lg font-black my-0.5 leading-tight">
                            {day.dayNum}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${isSelected ? "text-white/90" : "text-slate-400"}`}
                          >
                            {day.monthLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FILTERS & VIEW MODE SWITCHER (Parrilla vs Tarjetas) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Filters: Sport & Duration */}
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Sport Selector */}
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-emerald-500" />{" "}
                        Deporte:
                      </label>
                      <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ALL">
                          Todos los Deportes ({sports.length})
                        </option>
                        {sports.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration Selector */}
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />{" "}
                        Duración:
                      </label>
                      <select
                        value={durationMinutes}
                        onChange={(e) =>
                          setDurationMinutes(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={60}>60 Minutos (1 Hora)</option>
                        <option value={120}>120 Minutos (2 Horas)</option>
                      </select>
                    </div>
                  </div>

                  {/* View Mode Toggle Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-end sm:self-center border border-slate-200/80 dark:border-slate-700">
                    <button
                      onClick={() => setPortalViewMode("GRID")}
                      style={
                        portalViewMode === "GRID"
                          ? {
                              backgroundColor: primaryColor,
                              color: "#ffffff",
                            }
                          : {}
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        portalViewMode === "GRID"
                          ? "shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Ver tabla de horarios general"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Parrilla de Horarios</span>
                    </button>

                    <button
                      onClick={() => setPortalViewMode("CARDS")}
                      style={
                        portalViewMode === "CARDS"
                          ? {
                              backgroundColor: primaryColor,
                              color: "#ffffff",
                            }
                          : {}
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        portalViewMode === "CARDS"
                          ? "shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Ver canchas en tarjetas indidivuales"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Vista por Canchas</span>
                    </button>
                  </div>
                </div>

                {/* 3. SCHEDULE DISPLAY SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Horarios y Disponibilidad</span>
                      <span className="text-xs font-medium text-slate-500">
                        ({activeCourts.length}{" "}
                        {activeCourts.length === 1 ? "cancha" : "canchas"})
                      </span>
                    </h3>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Fecha:{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {selectedDate}
                      </strong>
                    </span>
                  </div>

                  {activeCourts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
                      <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No hay canchas disponibles para los filtros
                        seleccionados.
                      </p>
                      <p className="text-xs text-slate-500">
                        Probá cambiar la fecha o seleccionar otro deporte.
                      </p>
                    </div>
                  ) : portalViewMode === "GRID" ? (
                    /* MODE A: HOURLY SCHEDULE MATRIX GRID (PARRILLA DE HORARIOS) */
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[650px]">
                          <thead>
                            <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800">
                              <th className="p-3.5 text-xs font-black text-slate-600 dark:text-slate-300 w-24 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-xs">
                                Horario
                              </th>
                              {activeCourts.map((court) => (
                                <th
                                  key={court.id}
                                  className="p-3.5 text-center border-l border-slate-200/60 dark:border-slate-800"
                                >
                                  <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-[9px] uppercase tracking-wider mb-0.5">
                                    {court.typeName}
                                  </span>
                                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    {court.name}
                                  </p>
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                    {formatClientPrice(court.pricePerHour)}/hr
                                  </p>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Compute unique hours across all active courts */}
                            {(() => {
                              // Collect time slots across courts
                              const allTimesSet = new Set<string>();
                              activeCourts.forEach((court) => {
                                const slots = getAvailableSlots(
                                  court,
                                  selectedDate,
                                  durationMinutes,
                                );
                                slots.forEach((s) => allTimesSet.add(s.time));
                              });

                              const sortedTimes =
                                Array.from(allTimesSet).sort();

                              if (sortedTimes.length === 0) {
                                return (
                                  <tr>
                                    <td
                                      colSpan={activeCourts.length + 1}
                                      className="p-8 text-center text-xs text-slate-500 font-semibold"
                                    >
                                      No hay horarios configurados para las
                                      canchas activas.
                                    </td>
                                  </tr>
                                );
                              }

                              return sortedTimes.map((timeStr) => (
                                <tr
                                  key={timeStr}
                                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                  {/* Time Column */}
                                  <td className="p-3 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900 sticky left-0 z-10 border-r border-slate-200/60 dark:border-slate-800">
                                    {timeStr} hs
                                  </td>

                                  {/* Cells for each court */}
                                  {activeCourts.map((court) => {
                                    const slots = getAvailableSlots(
                                      court,
                                      selectedDate,
                                      durationMinutes,
                                    );
                                    const slot = slots.find(
                                      (s) => s.time === timeStr,
                                    );

                                    if (!slot) {
                                      return (
                                        <td
                                          key={court.id}
                                          className="p-2 text-center text-[10px] text-slate-300 dark:text-slate-700 bg-slate-50/20 dark:bg-slate-900/40 border-l border-slate-100 dark:border-slate-800"
                                        >
                                          -
                                        </td>
                                      );
                                    }

                                    if (!slot.isAvailable) {
                                      return (
                                        <td
                                          key={court.id}
                                          className="p-2 text-center border-l border-slate-100 dark:border-slate-800"
                                        >
                                          <span className="inline-block px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 text-[10px] font-bold line-through cursor-not-allowed">
                                            {slot.reason || "Ocupado"}
                                          </span>
                                        </td>
                                      );
                                    }

                                    return (
                                      <td
                                        key={court.id}
                                        className="p-2 text-center border-l border-slate-100 dark:border-slate-800"
                                      >
                                        <button
                                          onClick={() =>
                                            handleSelectSlot(court, slot.time)
                                          }
                                          className="w-full py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-center transition-all cursor-pointer shadow-2xs hover:scale-[1.03] active:scale-95 group"
                                        >
                                          <p className="text-[11px] font-black group-hover:text-white">
                                            {formatClientPrice(slot.price)}
                                          </p>
                                          <p className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-100 uppercase tracking-tight">
                                            Reservar
                                          </p>
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* MODE B: INDIVIDUAL COURT CARDS VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeCourts.map((court) => {
                        const slots = getAvailableSlots(
                          court,
                          selectedDate,
                          durationMinutes,
                        );
                        const freeSlotsCount = slots.filter(
                          (s) => s.isAvailable,
                        ).length;

                        return (
                          <div
                            key={court.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all hover:border-blue-500/50"
                          >
                            {/* Card Header */}
                            <div className="p-5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                              <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                                  {court.typeName}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                  {court.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                  {court.description ||
                                    "Cancha equipada con iluminación profesional."}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-xs text-slate-400 font-medium">
                                  Precio estimado
                                </p>
                                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                  {formatClientPrice(court.pricePerHour)}{" "}
                                  <span className="text-xs font-normal text-slate-400">
                                    /hr
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Available Time Slots Grid */}
                            <div className="p-5 space-y-3 flex-1">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span>
                                  Turnos disponibles ({freeSlotsCount}):
                                </span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  Hacé clic en la hora deseada
                                </span>
                              </div>

                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {slots.map((slot) => {
                                  if (!slot.isAvailable) {
                                    return (
                                      <div
                                        key={slot.time}
                                        className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 text-center cursor-not-allowed opacity-50"
                                      >
                                        <p className="text-xs font-bold text-slate-400 line-through">
                                          {slot.time}
                                        </p>
                                        <p className="text-[9px] text-rose-500 font-semibold">
                                          {slot.reason}
                                        </p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <button
                                      key={slot.time}
                                      onClick={() =>
                                        handleSelectSlot(court, slot.time)
                                      }
                                      className="py-2.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/80 text-center transition-all group cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
                                    >
                                      <span className="text-xs font-black group-hover:text-white leading-tight">
                                        {slot.time} hs
                                      </span>
                                      <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 group-hover:text-emerald-100 my-0.5">
                                        {formatClientPrice(slot.price)}
                                      </span>
                                      <span className="text-[9px] font-bold uppercase tracking-tight text-emerald-600 dark:text-emerald-400 group-hover:text-white bg-emerald-100 dark:bg-emerald-900/60 group-hover:bg-emerald-700 px-1.5 py-0.5 rounded-md">
                                        Reservar
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1 text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Horario: {court.openingTime} a{" "}
                                {court.closingTime} hs
                              </span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                Seña: {settings.depositPercentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER DETAILS & PAYMENT METHOD */}
            {step === 3 && selectedCourt && (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Back button */}
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Cambiar cancha u horario
                </button>

                {/* Selected Slot Summary Box */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wide">
                      Resumen del Turno
                    </span>
                    <span className="text-xs font-semibold text-blue-100">
                      Duración: {durationMinutes} Minutos (1 Hora Mínimo)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black">
                        {selectedCourt.name}
                      </h3>
                      <p className="text-xs text-blue-100 font-medium">
                        {selectedCourt.typeName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-white">
                        {formatClientPrice(
                          calculatePrice(
                            selectedCourt,
                            selectedDate,
                            selectedStartTime,
                            durationMinutes,
                          ),
                        )}
                      </p>
                      <p className="text-[11px] text-blue-100 font-bold">
                        Seña ({settings.depositPercentage || 50}%):{" "}
                        {formatClientPrice(
                          Math.round(
                            calculatePrice(
                              selectedCourt,
                              selectedDate,
                              selectedStartTime,
                              durationMinutes,
                            ) *
                              ((settings.depositPercentage || 50) / 100),
                          ),
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex flex-wrap items-center justify-between text-xs text-blue-100 gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                        "es-AR",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      Horario: {selectedStartTime} hs
                    </span>
                  </div>
                </div>

                {/* Form Error Alert */}
                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleConfirmBooking}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Completá tus datos para confirmar</span>
                    </h3>
                  </div>

                  {/* User Account Login Banner in Step 3 */}
                  {portalUser ? (
                    <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {portalUser.avatarUrl ? (
                          <img
                            src={portalUser.avatarUrl}
                            alt={portalUser.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                            {portalUser.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs truncate">
                            Sesión iniciada como {portalUser.name}
                          </p>
                          <p className="text-[11px] text-blue-600 dark:text-blue-300 truncate">
                            {portalUser.email} • Vía{" "}
                            {portalUser.provider === "google"
                              ? "Google"
                              : "Email"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-700 hover:bg-blue-100/50 transition-all cursor-pointer shrink-0"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>¿Querés autocompletar tus datos?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Ingresar con Nombre y WhatsApp</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nombre y Apellido{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Gonzalo Martínez"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Teléfono / WhatsApp{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej: 11 3456-7890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email (opcional, para enviar comprobante)
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Payment Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Seleccioná el Método de Pago de la Seña:</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("TRANSFER")}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentMethod === "TRANSFER"
                            ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                            Transferencia
                          </span>
                          <CheckCircle2
                            className={`w-4 h-4 ${paymentMethod === "TRANSFER" ? "text-emerald-600" : "text-slate-300"}`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                          CBU / Alias bancario. Envío de comprobante por
                          WhatsApp.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("MERCADO_PAGO")}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentMethod === "MERCADO_PAGO"
                            ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/30"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">
                            Mercado Pago
                          </span>
                          <CheckCircle2
                            className={`w-4 h-4 ${paymentMethod === "MERCADO_PAGO" ? "text-blue-600" : "text-slate-300"}`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                          Transferencia o pago directo a Mercado Pago.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CASH")}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentMethod === "CASH"
                            ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/30"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                            Pagar en Complejo
                          </span>
                          <CheckCircle2
                            className={`w-4 h-4 ${paymentMethod === "CASH" ? "text-blue-600" : "text-slate-300"}`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                          Abonar seña en efectivo al llegar a la cancha.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* DISPLAY CONFIGURABLE BANK TRANSFER DETAILS WHEN TRANSFER IS SELECTED */}
                  {paymentMethod === "TRANSFER" && (
                    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/40 shadow-md space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-emerald-400" />
                          <h4 className="font-extrabold text-sm text-emerald-200">
                            Datos Bancarios para Transferencia de Seña
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          Seña:{" "}
                          {formatClientPrice(
                            Math.round(
                              calculatePrice(
                                selectedCourt,
                                selectedDate,
                                selectedStartTime,
                                durationMinutes,
                              ) *
                                ((settings.depositPercentage || 50) / 100),
                            ),
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-400 text-[10px] font-medium">
                            Banco / Entidad:
                          </p>
                          <p className="font-bold text-white text-sm mt-0.5">
                            {bank.bankName}
                          </p>
                        </div>

                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          <p className="text-slate-400 text-[10px] font-medium">
                            Titular de la Cuenta:
                          </p>
                          <p className="font-bold text-white text-sm mt-0.5">
                            {bank.accountHolder}
                          </p>
                        </div>

                        {/* CBU/CVU with Copy Button */}
                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-slate-400 text-[10px] font-medium">
                              CBU / CVU:
                            </p>
                            <p className="font-mono font-bold text-emerald-300 text-sm tracking-wide mt-0.5 select-all">
                              {bank.cbuCvu}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyBankField(bank.cbuCvu, "cbu")
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          >
                            {copiedCbu ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedCbu ? "¡Copiado!" : "Copiar CBU"}
                            </span>
                          </button>
                        </div>

                        {/* Alias with Copy Button */}
                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-slate-400 text-[10px] font-medium">
                              Alias CBU / CVU:
                            </p>
                            <p className="font-mono font-black text-amber-300 text-base tracking-wider mt-0.5 select-all">
                              {bank.alias}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyBankField(bank.alias, "alias")
                            }
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          >
                            {copiedAlias ? (
                              <Check className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedAlias ? "¡Copiado!" : "Copiar Alias"}
                            </span>
                          </button>
                        </div>

                        {bank.cuitCuil && (
                          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                            <p className="text-slate-400 text-[10px] font-medium">
                              CUIT / CUIL:
                            </p>
                            <p className="font-mono font-bold text-white text-xs mt-0.5">
                              {bank.cuitCuil}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-emerald-200/90 font-medium leading-relaxed bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/50">
                        💡 <strong>Nota:</strong> Al finalizar la reserva
                        recibirás un enlace directo para enviar el comprobante
                        de transferencia al WhatsApp de {settings.complexName}.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "MERCADO_PAGO" && (
                    <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border border-blue-500/40 shadow-md space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-blue-800/60 pb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-400" />
                          <h4 className="font-extrabold text-sm text-blue-200">
                            Datos para Pago por Mercado Pago
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                          Seña:{" "}
                          {formatClientPrice(
                            Math.round(
                              calculatePrice(
                                selectedCourt,
                                selectedDate,
                                selectedStartTime,
                                durationMinutes,
                              ) *
                                ((settings.depositPercentage || 50) / 100),
                            ),
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {mp.accountHolder && (
                          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                            <p className="text-slate-400 text-[10px] font-medium">
                              Titular de la Cuenta MP:
                            </p>
                            <p className="font-bold text-white text-sm mt-0.5">
                              {mp.accountHolder}
                            </p>
                          </div>
                        )}

                        {/* Alias or Email MP with Copy Button */}
                        {mp.mpAliasOrEmail && (
                          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-slate-400 text-[10px] font-medium">
                                Alias / Email Mercado Pago:
                              </p>
                              <p className="font-mono font-black text-blue-300 text-base tracking-wider mt-0.5 select-all">
                                {mp.mpAliasOrEmail}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyMpField(mp.mpAliasOrEmail!, "mpAlias")
                              }
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                            >
                              {copiedMpAlias ? (
                                <Check className="w-3.5 h-3.5 text-blue-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {copiedMpAlias ? "¡Copiado!" : "Copiar Alias"}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* CVU MP with Copy Button */}
                        {mp.cvuMp && (
                          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-slate-400 text-[10px] font-medium">
                                CVU Mercado Pago:
                              </p>
                              <p className="font-mono font-bold text-emerald-300 text-sm tracking-wide mt-0.5 select-all">
                                {mp.cvuMp}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyMpField(mp.cvuMp!, "mpCvu")
                              }
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                            >
                              {copiedMpCvu ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {copiedMpCvu ? "¡Copiado!" : "Copiar CVU"}
                              </span>
                            </button>
                          </div>
                        )}

                        {mp.cuitCuilMp && (
                          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                            <p className="text-slate-400 text-[10px] font-medium">
                              CUIT / CUIL Titular MP:
                            </p>
                            <p className="font-mono font-bold text-white text-xs mt-0.5">
                              {mp.cuitCuilMp}
                            </p>
                          </div>
                        )}

                        {/* Optional Checkout Link */}
                        {mp.checkoutLinkMp && (
                          <div className="sm:col-span-2 pt-1">
                            <a
                              href={mp.checkoutLinkMp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Abrir Link de Pago en Mercado Pago</span>
                            </a>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-blue-200/90 font-medium leading-relaxed bg-blue-950/50 p-2.5 rounded-xl border border-blue-800/50">
                        💡 <strong>Nota:</strong>{" "}
                        {mp.notesMp ||
                          "Transferir la seña al Alias/CVU de Mercado Pago y enviar el comprobante por WhatsApp."}
                      </p>
                    </div>
                  )}

                  {paymentMethod === "CASH" && (
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      <p className="font-bold">Pago en Efectivo:</p>
                      <p>
                        {settings.cashPaymentNotes ||
                          "Podrás abonar en la recepción del complejo antes del inicio del turno."}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Observaciones o Pedido Especial (opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Alquiler de paletas, pelotas de pádel..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      boxShadow: `0 10px 25px -5px ${primaryColor}40`,
                    }}
                    className="w-full py-4 px-6 rounded-2xl text-white font-black text-sm transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar y Finalizar Reserva</span>
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: DIGITAL CONFIRMATION TICKET / VOUCHER (NO QR) */}
            {step === 4 && confirmedBooking && selectedCourt && (
              <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
                <div
                  style={{ borderColor: `${primaryColor}60` }}
                  className="bg-white dark:bg-slate-900 border-2 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden"
                >
                  <div
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-slate-100 dark:ring-slate-800"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}40`,
                      }}
                      className="px-3.5 py-1 rounded-full font-black text-xs uppercase tracking-wider border"
                    >
                      ¡Reserva Registrada Exitosamente!
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                      {settings.complexName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Código de reserva:{" "}
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {confirmedBooking.id}
                      </span>
                    </p>
                  </div>

                  {/* Ticket Details */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 text-left space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-slate-500 font-medium">
                        Cancha:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedCourt.name} ({selectedCourt.typeName})
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-slate-500 font-medium">Fecha:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(
                          confirmedBooking.date + "T00:00:00",
                        ).toLocaleDateString("es-AR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-slate-500 font-medium">
                        Horario:
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                        {confirmedBooking.startTime} hs a{" "}
                        {confirmedBooking.endTime} hs (
                        {confirmedBooking.durationMinutes} min)
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-slate-500 font-medium">
                        Titular:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {confirmedBooking.customerName} (
                        {confirmedBooking.customerPhone})
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-slate-500 font-medium">
                        Método de Pago:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        {confirmedBooking.payment.method === "TRANSFER"
                          ? "Transferencia Bancaria"
                          : confirmedBooking.payment.method === "MERCADO_PAGO"
                            ? "Mercado Pago"
                            : "Efectivo en Complejo"}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Monto Total Turno:
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatClientPrice(confirmedBooking.totalPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Monto de Seña Requerida:</span>
                      <span>
                        {formatClientPrice(confirmedBooking.payment.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Bank Information Box on Ticket if Transfer was chosen */}
                  {confirmedBooking.payment.method === "TRANSFER" && (
                    <div className="bg-slate-900 text-white rounded-2xl p-4 text-left text-xs space-y-3 border border-emerald-500/40">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold border-b border-slate-800 pb-2">
                        <Building2 className="w-4 h-4" />
                        <span>
                          Datos para Transferir la Seña (
                          {formatClientPrice(confirmedBooking.payment.amount)}):
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[11px]">
                        <p>
                          <span className="text-slate-400 font-sans">
                            Banco:
                          </span>{" "}
                          <strong>{bank.bankName}</strong>
                        </p>
                        <p>
                          <span className="text-slate-400 font-sans">
                            Titular:
                          </span>{" "}
                          <strong>{bank.accountHolder}</strong>
                        </p>
                        <p>
                          <span className="text-slate-400 font-sans">
                            Alias:
                          </span>{" "}
                          <strong className="text-amber-300 font-extrabold text-xs">
                            {bank.alias}
                          </strong>
                        </p>
                        <p>
                          <span className="text-slate-400 font-sans">CBU:</span>{" "}
                          <strong className="text-emerald-300">
                            {bank.cbuCvu}
                          </strong>
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleCopyBankField(bank.alias, "alias")
                          }
                          className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold border border-emerald-500/40 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar Alias</span>
                        </button>
                        <button
                          onClick={() =>
                            handleCopyBankField(bank.cbuCvu, "cbu")
                          }
                          className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold border border-emerald-500/40 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar CBU</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Direct WhatsApp Receipt Button */}
                  <div className="flex flex-col gap-3 pt-2">
                    <a
                      href={createWhatsAppDepositReceiptLink({
                        complexPhone: settings.whatsapp || settings.phone,
                        complexName: settings.complexName,
                        bookingId: confirmedBooking.id,
                        customerName: confirmedBooking.customerName,
                        customerPhone: confirmedBooking.customerPhone,
                        courtName: selectedCourt.name,
                        courtTypeName: selectedCourt.typeName,
                        date: confirmedBooking.date,
                        startTime: confirmedBooking.startTime,
                        endTime: confirmedBooking.endTime,
                        durationMinutes: confirmedBooking.durationMinutes,
                        depositAmount: confirmedBooking.payment.amount,
                        totalPrice: confirmedBooking.totalPrice,
                        paymentMethod: confirmedBooking.payment.method,
                        notes: notes,
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {confirmedBooking.payment.method === "TRANSFER" ||
                        confirmedBooking.payment.method === "MERCADO_PAGO"
                          ? "Enviar Comprobante por WhatsApp"
                          : "Contactar por WhatsApp"}
                      </span>
                    </a>

                    <button
                      onClick={() => {
                        setStep(1);
                        setConfirmedBooking(null);
                        setSelectedCourt(null);
                        setCustomerName("");
                        setCustomerPhone("");
                        setNotes("");
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Realizar otra reserva</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BOOKINGS LOOKUP */}
        {activeTab === "MY_BOOKINGS" && (
          <div className="max-w-xl mx-auto space-y-6">
            {/* Feedback messages */}
            {cancelSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{cancelSuccessMsg}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCancelSuccessMsg(null);
                      setLastCancelledNoticeData(null);
                    }}
                    className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {lastCancelledNoticeData && (
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex flex-wrap gap-2">
                    <a
                      href={createWhatsAppCancellationNoticeToAdminLink({
                        complexPhone: settings.whatsapp || settings.phone,
                        complexName: settings.complexName,
                        bookingId: lastCancelledNoticeData.bookingId,
                        customerName: lastCancelledNoticeData.customerName,
                        customerPhone: lastCancelledNoticeData.customerPhone,
                        courtName: lastCancelledNoticeData.courtName,
                        date: lastCancelledNoticeData.date,
                        startTime: lastCancelledNoticeData.startTime,
                        reason: lastCancelledNoticeData.reason,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Notificar al Administrador</span>
                    </a>

                    <a
                      href={createWhatsAppCancellationNoticeToCustomerLink({
                        customerPhone: lastCancelledNoticeData.customerPhone,
                        customerName: lastCancelledNoticeData.customerName,
                        complexName: settings.complexName,
                        bookingId: lastCancelledNoticeData.bookingId,
                        courtName: lastCancelledNoticeData.courtName,
                        date: lastCancelledNoticeData.date,
                        startTime: lastCancelledNoticeData.startTime,
                        reason: lastCancelledNoticeData.reason,
                        settings,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Notificar al Cliente</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {editSuccessMsg && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{editSuccessMsg}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditSuccessMsg(null);
                      setLastEditedNoticeData(null);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {lastEditedNoticeData && (
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex flex-wrap gap-2">
                    <a
                      href={createWhatsAppModificationNoticeToAdminLink({
                        ...lastEditedNoticeData,
                        complexName: settings.complexName,
                        complexPhone: settings.whatsapp || settings.phone,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Notificar al Administrador</span>
                    </a>

                    <a
                      href={createWhatsAppModificationNoticeToCustomerLink({
                        ...lastEditedNoticeData,
                        complexName: settings.complexName,
                        complexPhone: settings.whatsapp || settings.phone,
                        settings,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Notificar al Cliente</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Consultar mis reservas activas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresá tu número de teléfono celular para verificar el estado
                  de tu turno, editarlo o cancelarlo.
                </p>
              </div>

              <form
                onSubmit={handleSearchCustomerBookings}
                className="flex gap-2"
              >
                <input
                  type="tel"
                  placeholder="Ej: 11 3456-7890"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 shadow-sm transition-all cursor-pointer"
                >
                  Buscar
                </button>
              </form>
            </div>

            {/* Results list */}
            {searchedBookings && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Resultados encontrados ({searchedBookings.length}):
                </h4>

                {searchedBookings.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No encontramos reservas registradas con este número.
                    </p>
                  </div>
                ) : (
                  searchedBookings.map((b) => {
                    const court = courts.find((c) => c.id === b.courtId);
                    return (
                      <div
                        key={b.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[11px]">
                              {court?.name || "Cancha"}
                            </span>
                            {court?.typeName && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {court.typeName}
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              b.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : b.status === "CANCELLED"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {b.status === "CONFIRMED"
                              ? "Confirmada"
                              : b.status === "CANCELLED"
                                ? "Cancelada"
                                : "Reservada"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                          <div>
                            <p className="text-slate-400 text-[10px]">Fecha</p>
                            <p className="text-slate-800 dark:text-slate-200">
                              {b.date}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px]">
                              Horario
                            </p>
                            <p className="text-slate-800 dark:text-slate-200">
                              {b.startTime} - {b.endTime} hs (
                              {b.durationMinutes || 60} min)
                            </p>
                          </div>
                        </div>

                        {b.notes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            💬 {b.notes}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-slate-500">
                            Monto total:{" "}
                            <strong className="text-slate-900 dark:text-white">
                              {formatClientPrice(b.totalPrice)}
                            </strong>
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            Código: #{b.id}
                          </span>
                        </div>

                        {/* Action buttons if not cancelled */}
                        {b.status !== "CANCELLED" && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditBooking(b)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 border border-blue-200 dark:border-blue-800/60 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar Reserva</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setBookingToCancel(b);
                                setCancellationReason("");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-800/60 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT BOOKING MODAL */}
      {bookingToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Editar Reserva #{bookingToEdit.id}
                </h3>
              </div>
              <button
                onClick={() => setBookingToEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmEdit} className="space-y-4">
              {/* Court selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cancha
                </label>
                <select
                  value={editCourtId}
                  onChange={(e) => {
                    setEditCourtId(e.target.value);
                    setEditStartTime("");
                    setEditError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activeCourts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.typeName}) - {formatClientPrice(c.pricePerHour)}/hr
                    </option>
                  ))}
                </select>
              </div>

              {/* Date selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setEditDate(e.target.value);
                      setEditStartTime("");
                      setEditError("");
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duración
                  </label>
                  <select
                    value={editDurationMinutes}
                    onChange={(e) => {
                      setEditDurationMinutes(Number(e.target.value));
                      setEditStartTime("");
                      setEditError("");
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={60}>60 Minutos (1 Hora)</option>
                    <option value={120}>120 Minutos (2 Horas)</option>
                  </select>
                </div>
              </div>

              {/* Slot Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Horarios Disponibles
                </label>

                {(() => {
                  const currentEditCourt = courts.find(
                    (c) => c.id === editCourtId,
                  );
                  if (!currentEditCourt) return null;
                  const slots = getAvailableSlotsForEdit(
                    currentEditCourt,
                    editDate,
                    editDurationMinutes,
                    bookingToEdit.id,
                  );

                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                      {slots.map((slot) => {
                        const isSelected = editStartTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => {
                              setEditStartTime(slot.time);
                              setEditError("");
                            }}
                            className={`p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : slot.isAvailable
                                  ? "bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                  : "bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed opacity-60"
                            }`}
                          >
                            <div>{slot.time} hs</div>
                            <div className="text-[10px] font-medium opacity-80">
                              {formatClientPrice(slot.price)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas o Aclaraciones
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ej: Necesitamos paletas de padel extra"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBookingToEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL BOOKING CONFIRMATION MODAL */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Cancelar Reserva #{bookingToCancel.id}
                </h3>
              </div>
              <button
                onClick={() => setBookingToCancel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                ¿Estás seguro que querés cancelar tu turno?
              </p>
              <div className="space-y-1 text-slate-600 dark:text-slate-400 font-medium pt-1">
                <p>
                  • <strong>Cancha:</strong>{" "}
                  {courts.find((c) => c.id === bookingToCancel.courtId)?.name ||
                    "Cancha"}
                </p>
                <p>
                  • <strong>Fecha y Horario:</strong> {bookingToCancel.date} de{" "}
                  {bookingToCancel.startTime} a {bookingToCancel.endTime} hs
                </p>
                <p>
                  • <strong>Monto Turno:</strong>{" "}
                  {formatClientPrice(bookingToCancel.totalPrice)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Motivo de cancelación (opcional)
              </label>
              <input
                type="text"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Ej: Imprevisto laboral / Cambio de fecha"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60">
              ⚠️ Al confirmar, el turno se liberará en el sistema y estará
              disponible para otros jugadores.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBookingToCancel(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                No, conservar reserva
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Action Button for Quick Support */}
      {(settings.whatsapp || settings.phone) && (
        <a
          href={
            cleanPhoneForWhatsApp(settings.whatsapp || settings.phone)
              ? `https://api.whatsapp.com/send?phone=${cleanPhoneForWhatsApp(settings.whatsapp || settings.phone)}&text=${encodeURIComponent(`Hola *${settings.complexName}*! 👋 Quisiera hacer una consulta sobre las canchas. 🏟️⚽🎾`)}`
              : `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola *${settings.complexName}*! 👋 Quisiera hacer una consulta sobre las canchas. 🏟️⚽🎾`)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all border border-emerald-400/40"
          title="Contactar al complejo por WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-current opacity-95 text-emerald-100" />
          <span className="hidden sm:inline font-black tracking-wide">WhatsApp</span>
        </a>
      )}

      <SharePortalModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        customUrl={getPublicPortalUrl()}
      />

      {/* Customer User Authentication Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleLoginSuccess}
        complexWhatsApp={settings.whatsapp || settings.phone}
        complexName={settings.complexName}
        initialMode="login"
      />

      {/* Mandatory Auth Notice Popup Modal */}
      {showMandatoryAuthNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowMandatoryAuthNotice(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-300 dark:border-amber-800/60 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                Inicio de Sesión Obligatorio
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Para reservar tu cancha en <strong className="text-slate-800 dark:text-slate-200">{settings.complexName}</strong>, es obligatorio iniciar sesión o estar registrado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>¿Cómo ingresar o registrarte? Es muy simple:</span>
              </div>
              <ol className="space-y-2 text-slate-600 dark:text-slate-300 font-medium pl-1 list-decimal list-inside leading-relaxed">
                <li>
                  Hacé clic en el botón <strong className="text-emerald-600 dark:text-emerald-400">"Iniciar Sesión / Registrarse Ahora"</strong>.
                </li>
                <li>
                  Ingresá tu <strong>Nombre y Apellido</strong> con tu número de <strong>WhatsApp / Teléfono</strong> (o ingresá vía Google).
                </li>
                <li>
                  ¡Listo! Tu sesión quedará activa y podrás confirmar tu reserva al instante.
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowMandatoryAuthNotice(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión / Registrarse Ahora</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMandatoryAuthNotice(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Cancelar / Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
