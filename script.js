// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Hero carousel functionality
const carouselSlides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;

function showSlide(index) {
    // Guard: exit if carouselSlides is empty (e.g., on contact page)
    if (!carouselSlides.length || !indicators.length) return;

    // Hide all slides
    carouselSlides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Remove active class from all indicators
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });

    // Show the selected slide
    carouselSlides[index].classList.add('active');
    indicators[index].classList.add('active');
    currentSlide = index;
}

// Add click events to indicators
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        showSlide(index);
    });
});

// Auto-advance carousel
function nextSlide() {
    let nextIndex = (currentSlide + 1) % carouselSlides.length;
    showSlide(nextIndex);
}

// Change slide every 8 seconds
setInterval(nextSlide, 8000);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}` ||
            (currentSection === '' && link.getAttribute('href') === '#')) {
            link.classList.add('active');
        }
    });
});

// Initialize the first slide as active
showSlide(0);

// Modal Functionality
const modal = document.getElementById('actionModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.querySelector('.close-modal');
const actionForm = document.getElementById('actionForm');

// Function to open modal
function openModal(title) {
    modalTitle.textContent = title;
    modal.style.display = 'block';

    // Animate content
    const content = modal.querySelector('.modal-content');
    content.style.animation = 'none';
    content.offsetHeight; /* trigger reflow */
    content.style.animation = 'slideUp 0.3s';

    // Toggle amount field visibility and button style
    const amountGroup = document.getElementById('amount-group');
    const amountInput = document.getElementById('amount');
    const submitBtn = actionForm.querySelector('button[type="submit"]');

    if (title === 'Make a Donation') {
        amountGroup.style.display = 'block';
        amountInput.required = true;
        submitBtn.textContent = 'Pay';
        submitBtn.style.backgroundColor = '#28a745'; // Green
        submitBtn.style.borderColor = '#28a745';
    } else {
        amountGroup.style.display = 'none';
        amountInput.required = false;
        amountInput.value = ''; // Clear value
        submitBtn.textContent = 'Submit Request';
        submitBtn.style.backgroundColor = ''; // Reset to default
        submitBtn.style.borderColor = '';
    }
}

// Open modal for Donate buttons
document.querySelectorAll('.btn-donate').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('Make a Donation', 'Donate Now');
    });
});

// Volunteer Button (assuming class .btn-secondary in cta-section is volunteer/partner if not specific)
// We need to identify specific buttons. Let's select all btn-primary and btn-secondary and check text
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (btn.classList.contains('btn-donate')) return; // handled above

        const text = btn.textContent.trim().toLowerCase();

        if (text.includes('volunteer')) {
            e.preventDefault();
            openModal('Become a Volunteer');
        } else if (text.includes('partner')) {
            e.preventDefault();
            openModal('Partner With Us');
        } else if (text === 'donate now') {
            // Handled by btn-donate class usually, but just in case
            e.preventDefault();
            openModal('Make a Donation');
        }
    });
});

// Close Modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Close outside click
if (modal) {
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Handle Form Submission
if (actionForm) {
    actionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = actionForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        // Collect form data
        const requestType = modalTitle.textContent;

        // Check if it's a donation
        if (requestType === 'Make a Donation') {
            payWithPaystack(e);
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        const templateParams = {
            from_name: document.getElementById('from_name').value,
            from_email: document.getElementById('from_email').value,
            from_contact: document.getElementById('from_contact').value,
            message: "Request Type: " + requestType,
            subject: requestType + " - New Request from " + document.getElementById('from_name').value
        };

        // Replace YOUR_SERVICE_ID and YOUR_TEMPLATE_ID with actual values from EmailJS dashboard
        emailjs.send('service_vmsslwf', 'template_evv5hce', templateParams)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Thank You!',
                    text: 'Your request has been received. We will contact you shortly.',
                    confirmButtonColor: '#0047AB'
                });
                modal.style.display = 'none';
                actionForm.reset();
            })
            .catch((error) => {
                console.error('FAILED...', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong. Please try again or contact us directly.',
                    confirmButtonColor: '#0047AB'
                });
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
    });
}

// Handle Contact Page Form Submission
const contactPageForm = document.getElementById('contactPageForm');
if (contactPageForm) {
    contactPageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactPageForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Sending Message...';
        btn.disabled = true;

        const templateParams = {
            from_name: document.getElementById('contact_name').value,
            from_email: document.getElementById('contact_email').value,
            from_contact: document.getElementById('contact_phone').value,
            message: document.getElementById('contact_message').value,
            subject: "New Contact Message from " + document.getElementById('contact_name').value
        };

        emailjs.send('service_vmsslwf', 'template_evv5hce', templateParams)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Message Sent!',
                    text: 'We have received your message and will get back to you shortly.',
                    confirmButtonColor: '#e63946'
                });
                contactPageForm.reset();
            })
            .catch((error) => {
                console.error('FAILED...', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Sending Failed',
                    text: 'Please try again later or contact us directly via phone.',
                    confirmButtonColor: '#e63946'
                });
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
    });
}
