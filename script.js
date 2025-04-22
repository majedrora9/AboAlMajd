const usernameInput = document.getElementById('username');
const timeSlotSelect = document.getElementById('time-slot');
const bookButton = document.getElementById('book-button');
const bookingStatus = document.getElementById('booking-status');
const mondayClosedMessage = document.getElementById('monday-closed');

// رابط تطبيق Google Apps Script الخاص بك
const scriptURL = 'https://script.google.com/macros/s/AKfycbyZW964381Wj1ZdMieUakqZisRpP-9VTPHbfSHbWoeEF-6qZrDEHAjmUrFP6GeBusFgoQ/exec';

// جلب الأوقات المتاحة
async function fetchAvailableTimes() {
    try {
        const response = await fetch(`${scriptURL}?action=getAvailableTimes`);
        const data = await response.json();

        if (data.availableTimes && Array.isArray(data.availableTimes)) {
            timeSlotSelect.innerHTML = '<option value="">اختر وقت الحجز</option>';
            data.availableTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time; // جاهز بصيغة 12 ساعة
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

// التحقق من يوم الاثنين (0 = الأحد، 1 = الإثنين)
function isMonday() {
    const today = new Date();
    return today.getDay() === 1;
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

    bookButton.disabled = true;

    timeSlotSelect.addEventListener('change', () => {
        bookButton.disabled = !usernameInput.value || !timeSlotSelect.value;
    });

    usernameInput.addEventListener('input', () => {
        bookButton.disabled = !usernameInput.value || !timeSlotSelect.value;
    });

    bookButton.addEventListener('click', async () => {
        const userName = usernameInput.value.trim();
        const bookingTime = timeSlotSelect.value;
        const selectedOption = timeSlotSelect.options[timeSlotSelect.selectedIndex];

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
                body: `action=bookTime&userName=${encodeURIComponent(userName)}&bookingTime=${encodeURIComponent(bookingTime)}`
            });
            const data = await response.json();
            if (data.success) {
                bookingStatus.textContent = data.message;
                bookingStatus.className = 'message success';
                timeSlotSelect.removeChild(selectedOption);
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
