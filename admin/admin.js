// تهيئة Firebase (استبدل ببيانات الاعتماد الخاصة بمشروعك في Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyC677JzDCsCzup2l4bxmXH1-aqvCUuToQE",
  authDomain: "aboalmajd-486a6.firebaseapp.com",
  projectId: "aboalmajd-486a6",
  storageBucket: "aboalmajd-486a6.firebasestorage.app",
  messagingSenderId: "725610405729",
  appId: "1:725610405729:web:0718744134924904baef20",
  measurementId: "G-RYJ46JS51S"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const authContainer = document.getElementById('auth-container');
const adminPanel = document.getElementById('admin-panel');
const authStatus = document.getElementById('auth-status');
const userInfoDiv = document.getElementById('user-info');
const userPhotoImg = document.getElementById('user-photo');
const userNameSpan = document.getElementById('user-name');
const cancelTimesSelect = document.getElementById('cancel-times');
const saveCancellationsButton = document.getElementById('save-cancellations');
const cancellationStatus = document.getElementById('cancellation-status');
const sheetsUrlInput = document.getElementById('sheets-url');
const sheetsIframe = document.getElementById('sheets-iframe');

// قائمة بحسابات الأدمن المسموح بها (عدلها حسب حاجتك)
const allowedAdmins = ['majedrora9@gmail.com', 'siciliamcserver@gmail.com'];

// استبدل بهذا الرابط بعنوان URL لتطبيق الويب الخاص بك في Google Apps Script
const scriptURL = 'https://script.google.com/macros/s/AKfycbyZW964381Wj1ZdMieUakqZisRpP-9VTPHbfSHbWoeEF-6qZrDEHAjmUrFP6GeBusFgoQ/exec';

// دالة لجلب الأوقات المتاحة لملء قائمة الإلغاء
async function fetchAllAvailableTimesForAdmin() {
    try {
        const response = await fetch(`${scriptURL}?action=getAvailableTimes`);
        const data = await response.json();

        if (data.availableTimes && Array.isArray(data.availableTimes)) {
            cancelTimesSelect.innerHTML = '';
            data.availableTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                cancelTimesSelect.appendChild(option);
            });
        } else {
            cancelTimesSelect.innerHTML = '<option value="">لا توجد أوقات متاحة</option>';
        }
    } catch (error) {
        console.error('حدث خطأ أثناء جلب الأوقات للإلغاء:', error);
        cancelTimesSelect.innerHTML = '<option value="">حدث خطأ أثناء التحميل</option>';
    }
}

// حدث تسجيل الدخول باستخدام جوجل
loginButton.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        if (user && allowedAdmins.includes(user.email)) {
            authStatus.textContent = '';
            authContainer.style.display = 'none';
            adminPanel.style.display = 'block';
            userPhotoImg.src = user.photoURL || '';
            userNameSpan.textContent = `مرحباً، ${user.displayName || 'أدمن'}`;
            localStorage.setItem('isAdminLoggedIn', 'true');
            fetchAllAvailableTimesForAdmin();
        } else {
            authStatus.textContent = 'لا يمكنك تسجيل الدخول بهذا الحساب.';
            authStatus.className = 'message error';
            await auth.signOut(); // تسجيل الخروج إذا لم يكن الحساب مسموحًا به
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        authStatus.textContent = `حدث خطأ في تسجيل الدخول: ${error.message}`;
        authStatus.className = 'message error';
    }
});

//تسجيل الخروج
logoutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
        adminPanel.style.display = 'none';
        authContainer.style.display = 'block';
        localStorage.removeItem('isAdminLoggedIn');
        authStatus.textContent = 'تم تسجيل الخروج بنجاح.';
        authStatus.className = 'message success';
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        authStatus.textContent = `حدث خطأ في تسجيل الخروج: ${error.message}`;
        authStatus.className = 'message error'; // تم الإكمال هنا
    }
});
