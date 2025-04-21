const usernameInput = document.getElementById('username');
const timeSlotSelect = document.getElementById('time-slot');
const bookButton = document.getElementById('book-button');
const bookingStatus = document.getElementById('booking-status');
const mondayClosedMessage = document.getElementById('monday-closed');

// استبدل بهذا الرابط بعنوان URL لتطبيق الويب الخاص بك في Google Apps Script
const scriptURL = 'https://script.google.com/macros/s/AKfycbyZW964381Wj1ZdMieUakqZisRpP-9VTPHbfSHbWoeEF-6qZrDEHAjmUrFP6GeBusFgoQ/exec';

// دالة لجلب الأوقات المتاحة من Google Apps Script
// دالة لتحويل الوقت من نظام 24 ساعة إلى 12 ساعة مع "مساءً" أو "صباحاً"
function convertTo12HourFormat(time24) {
    const [hour, minute] = time24.split(':').map(Number); // تقسيم الوقت إلى ساعة ودقيقة
    let period = 'مساءً'; // نعتبر جميع الأوقات في المساء (إلا لو كانت الصباح)
    let hour12 = hour % 12; // تحويل الساعة إلى 12 ساعة (إذا كانت الساعة 0 تصبح 12)
    
    if (hour === 0) {
        hour12 = 12; // الساعة 0 تصبح 12:00 صباحاً
        period = 'صباحاً';
    } else if (hour < 12) {
        period = 'صباحاً';
    } else if (hour === 12) {
        hour12 = 12; // الساعة 12 تبقى 12:00
    }
    
    return `${hour12}:${minute < 10 ? '00' : minute} ${period}`; // إعادة صياغة الوقت
}

// دالة لجلب الأوقات المتاحة من Google Apps Script
async function fetchAvailableTimes() {
    try {
        const response = await fetch(`${scriptURL}?action=getAvailableTimes`);
        const data = await response.json();
        console.log(data); // أضف هذا السطر لمساعدتك في التصحيح

        if (data.availableTimes && Array.isArray(data.availableTimes)) {
            timeSlotSelect.innerHTML = '<option value="">اختر وقت الحجز</option>';
            data.availableTimes.forEach(time => {
                const option = document.createElement('option');
                const time12 = convertTo12HourFormat(time); // تحويل الوقت إلى 12 ساعة مع مساءً/صباحاً
                option.value = time;
                option.textContent = time12; // عرض الوقت المحول
                timeSlotSelect.appendChild(option);
            });
            timeSlotSelect.disabled = false;
            bookButton.disabled = !usernameInput.value || !timeSlotSelect.value;
        } else {
            timeSlotSelect.innerHTML = '<option value="">لا توجد أوقات متاحة حاليًا</option>';
            timeSlotSelect.disabled = true;
            bookButton.disabled = true;
        }
    } catch (error) {
        console.error('حدث خطأ أثناء جلب الأوقات:', error);
        timeSlotSelect.innerHTML = '<option value="">حدث خطأ أثناء التحميل</option>';
        timeSlotSelect.disabled = true;
        bookButton.disabled = true;
    }
}


// دالة للتحقق مما إذا كان اليوم هو الاثنين
function isMonday() {
    const today = new Date();
    return today.getDay() === 4; // تم التصحيح: 1 يمثل يوم الاثنين
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (isMonday()) {
        mondayClosedMessage.style.display = 'block';
        timeSlotSelect.disabled = true;
        bookButton.disabled = true;
    } else {
        fetchAvailableTimes();
    }

    // تعطيل زر الحجز في البداية
    bookButton.disabled = true;

    // تفعيل زر الحجز عند اختيار وقت
    timeSlotSelect.addEventListener('change', () => {
        bookButton.disabled = !usernameInput.value || !timeSlotSelect.value;
    });

    // تفعيل زر الحجز عند إدخال اسم المستخدم واختيار وقت
    usernameInput.addEventListener('input', () => {
        bookButton.disabled = !usernameInput.value || !timeSlotSelect.value;
    });

    // حدث النقر على زر الحجز
    bookButton.addEventListener('click', async () => {
        const userName = usernameInput.value.trim();
        const bookingTime = timeSlotSelect.value; // القيمة من <select> هي بنظام 12 ساعة مع مساءً/ظهرًا
        const selectedOption = timeSlotSelect.options[timeSlotSelect.selectedIndex]; // الحصول على الخيار المحدد

        if (!userName) {
            bookingStatus.textContent = 'يرجى إدخال اسم المستخدم.';
            bookingStatus.className = 'message error';
            return;
        }

        if (!bookingTime) {
            bookingStatus.textContent = 'يرجى اختيار وقت الحجز.';
            bookingStatus.className = 'message error';
            return;
        }

        try {
            const response = await fetch(scriptURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=bookTime&userName=${encodeURIComponent(userName)}&bookingTime=${encodeURIComponent(bookingTime)}` // إرسال الوقت بنظام 12 ساعة مع مساءً/ظهرًا
            });
            const data = await response.json();
            if (data.success) {
                bookingStatus.textContent = data.message;
                bookingStatus.className = 'message success';
                timeSlotSelect.removeChild(selectedOption); // إزالة الخيار المحدد من القائمة
                // مسح حقول الإدخال
                usernameInput.value = '';
                timeSlotSelect.value = '';
                bookButton.disabled = true;
            } else {
                bookingStatus.textContent = data.message || 'حدث خطأ أثناء الحجز.';
                bookingStatus.className = 'message error';
            }
        } catch (error) {
            console.error('حدث خطأ أثناء إرسال طلب الحجز:', error);
            bookingStatus.textContent = 'حدث خطأ غير متوقع.';
            bookingStatus.className = 'message error';
        }
    });
});
