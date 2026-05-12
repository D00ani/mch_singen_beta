        // --- 3. FORMULAR LOGIK ---
        const contactForm = document.getElementById('my-contact-form');
        const successBox = document.getElementById('success-message');

        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Wird gesendet...';
                submitBtn.disabled = true;

                fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        contactForm.style.display = 'none';
                        successBox.style.display = 'block';
                    } else {
                        alert("Es gab leider ein Problem beim Senden.");
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    alert("Verbindungsfehler.");
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            });
        }
        // NEU: Funktion zum einfachen Schließen der Danke-Box
        function closeSuccess() {
            successBox.style.display = 'none';
            contactForm.style.display = 'flex';
            contactForm.reset();
        }