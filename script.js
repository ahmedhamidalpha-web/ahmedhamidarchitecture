document.addEventListener("DOMContentLoaded", function() {

    // 1. تفعيل عمل فلتر الصور الخاص بـ Project Gallery
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // إزالة الكلاس النشط من كافة الأزرار وإضافته للمضغطوط عليه
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });

    // 2. تفعيل عمل زر الإرسال داخل الـ Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you! Your message has been sent successfully to Ahmed Hamid Architecture team.');
            contactForm.reset();
        });
    }

    // 3. زر الصعود إلى الأعلى السلس (Scroll to top)
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.style.display = 'block';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 4. القائمة المتجاوبة مع الموبايل (Hamburger Menu)
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.querySelector('.navbar');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navbar.classList.toggle('active');
            mobileMenu.classList.toggle('open');
        });
    }
});
