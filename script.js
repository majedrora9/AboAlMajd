const bookingForm = document.getElementById("bookingForm");
const selectTime = document.getElementById("time");
const defaultTimes = [
  "2:00 ظهراً", "2:30 ظهراً", "3:00 عصراً", "3:30 عصراً", "4:00 عصراً", "4:30 عصراً", 
  "5:00 مساءً", "5:30 مساءً", "6:00 مساءً", "6:30 مساءً", "7:00 مساءً", "7:30 مساءً", "8:00 مساءً"
];

// دالة للتحقق من الوقت المنقضي
function isTimePassed(time) {
  const now = new Date(); // استخدم الوقت الفعلي الآن
  const [hourMinute, period] = time.split(' ');
  const [hour, minute] = hourMinute.split(':').map(Number);

  let hour24 = hour;
  if (period === 'ظهراً' && hour === 12) hour24 = 0; // تحويل 12 ظهراً إلى 0
  if (period === 'عصراً' && hour < 12) hour24 += 12; // تحويل إلى 24 ساعة
  if (period === 'مساءً' && hour < 12) hour24 += 12; // تحويل إلى 24 ساعة

  // التحقق من الوقت الحالي
  const currentTime = new Date();
  currentTime.setHours(hour24, minute, 0, 0); // تعيين الوقت الصحيح للمقارنة

  const diff = currentTime.getTime() - now.getTime(); // الفرق بين الوقت الحالي والوقت المحدد

  // إذا مر أكثر من دقيقة، نعتبر الوقت قد مر
  return diff < 0; // إذا كان الوقت في الماضي سيعيد true
}

// دالة لتحميل الأوقات المتاحة
function loadAvailableTimes() {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const bookedTimes = bookings.map(b => b.time);
  const deletedTimes = JSON.parse(localStorage.getItem("deletedTimes") || "[]");

  const availableTimes = defaultTimes.filter(t => {
    const passed = isTimePassed(t);
    const deleted = deletedTimes.includes(t);
    const booked = bookedTimes.includes(t);

    // تأكد من أن الوقت لم يمر بعد، ولم يُحذف ولم يُحجز بعد
    return !passed && !deleted && !booked;
  });

  selectTime.innerHTML = '<option value="">اختر الوقت</option>' +
    availableTimes.map(t => `<option>${t}</option>`).join('');
}

// التعامل مع عملية الحجز
bookingForm.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const time = selectTime.value;

  if (!time) return alert("يرجى اختيار وقت.");

  // تأكد من أن الوقت ليس محذوفًا
  const deletedTimes = JSON.parse(localStorage.getItem("deletedTimes") || "[]");
  if (deletedTimes.includes(time)) {
    alert("هذا الوقت تم حذفه.");
    return;
  }

  // حفظ الحجز
  const booking = { name, time };
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  alert("تم الحجز بنجاح!");
  bookingForm.reset();
  loadAvailableTimes();
};

// فحص إذا اليوم يوم الإثنين
const today = new Date();
if (today.getDay() === 1) {
  bookingForm.innerHTML = "<strong>عذراً، نحن نغلق يوم الأثنين.</strong>";
} else {
  loadAvailableTimes();
}
