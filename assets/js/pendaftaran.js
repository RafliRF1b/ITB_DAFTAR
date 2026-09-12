document.addEventListener("DOMContentLoaded", function () {
    // --- ELEMEN FORM ---
    const form = document.getElementById("form-pendaftaran-lomba");
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxvin3F-lB5S--gWXhx3URC956rStdiaXhA2r9HLbTHseb6EeaX5nu78lQ_DHkkM6X6GQ/exec';
    const submitButton = form ? form.querySelector('.submit') : null;
    const submitLabel = submitButton ? submitButton.querySelector('.retro-btn__label') : null;

    // --- ELEMEN UPLOAD UI ---
    const fileInput = document.getElementById('payment_proof');
    const dropzone = document.getElementById('dropzone');
    const fileBtn = document.getElementById('fileBtn');
    const uploadLabel = document.getElementById('upload-label');
    const uploadSuccess = document.getElementById('upload-success');
    const uploadFilename = document.getElementById('upload-filename');
    const changeFileButton = document.getElementById('change-file-button');

    // --- ELEMEN UX ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const modal = document.getElementById('custom-modal');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseButton = document.getElementById('modal-close-button');

    function setSubmitLabel(text) {
        if (submitLabel) {
            submitLabel.textContent = text;
        } else if (submitButton) {
            submitButton.value = text;
        }
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            if (loadingOverlay) loadingOverlay.style.display = 'flex';
            if (submitButton) submitButton.disabled = true;
            setSubmitLabel("Mengirim...");

            const formData = new FormData(form);
            const file = fileInput && fileInput.files ? fileInput.files[0] : null;

            if (file) {
                // Validasi ukuran file (Maks 5 MB)
                if (file.size > 5 * 1024 * 1024) {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    if (submitButton) submitButton.disabled = false;
                    setSubmitLabel("KIRIM PENDAFTARAN");
                    showModal('❌', 'Ukuran File Terlalu Besar', 'Maksimal ukuran file bukti pembayaran adalah 5 MB.');
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    formData.delete('payment_proof');
                    formData.append('payment_proof_base64', reader.result);
                    formData.append('payment_proof_filename', file.name);
                    sendData(formData);
                };
                reader.onerror = function () {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    if (submitButton) submitButton.disabled = false;
                    setSubmitLabel("KIRIM PENDAFTARAN");
                    showModal('❌', 'Gagal', 'Terjadi kesalahan saat membaca file. Silakan coba lagi.');
                };
            } else {
                sendData(formData);
            }
        });
    }

    function sendData(formData) {
        fetch(scriptURL, { 
            method: "POST", 
            body: formData 
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                form.reset();
                resetUploadUI();
                resetPaymentSelections();
                showModal('✅', 'Berhasil Terkirim!', data.message || 'Data pendaftaran berhasil tersimpan.');
            } else {
                showModal('❌', 'Gagal!', data.message || 'Terjadi kesalahan pada server.');
            }
        })
        .catch(error => {
            console.error("Error!", error);
            showModal('❌', 'Error Jaringan', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        })
        .finally(() => {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            if (submitButton) submitButton.disabled = false;
            setSubmitLabel("KIRIM PENDAFTARAN");
        });
    }

    // --- LOGIKA MODAL ---
    function showModal(icon, title, message) {
        if (!modal) return;
        if (modalIcon) modalIcon.textContent = icon;
        if (modalTitle) modalTitle.textContent = title;
        if (modalMessage) modalMessage.textContent = message;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function hideModal() {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    if (modalCloseButton) modalCloseButton.addEventListener('click', hideModal);
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) hideModal();
        });
    }

    // --- LOGIKA UPLOAD FILE ---
    function showUploadedState(filename) {
        if (uploadLabel) uploadLabel.style.display = 'none';
        if (uploadSuccess) uploadSuccess.style.display = 'flex';
        if (uploadFilename) uploadFilename.textContent = filename;
    }

    function resetUploadUI() {
        if (uploadLabel) uploadLabel.style.display = 'flex';
        if (uploadSuccess) uploadSuccess.style.display = 'none';
        if (uploadFilename) uploadFilename.textContent = '';
    }

    if (fileBtn && fileInput) {
        fileBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                showUploadedState(this.files[0].name);
            }
        });
    }

    if (changeFileButton && fileInput) {
        changeFileButton.addEventListener('click', () => fileInput.click());
    }

    if (dropzone && fileInput) {
        ['dragenter', 'dragover'].forEach(evt => {
            dropzone.addEventListener(evt, e => {
                e.preventDefault();
                dropzone.classList.add('is-dragover');
            });
        });
        ['dragleave', 'drop'].forEach(evt => {
            dropzone.addEventListener(evt, e => {
                e.preventDefault();
                dropzone.classList.remove('is-dragover');
            });
        });
        dropzone.addEventListener('drop', e => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                showUploadedState(e.dataTransfer.files[0].name);
            }
        });
    }

    // --- LOGIKA KARTU RADIO ---
    function wireRadioCardGroup(selector) {
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            const input = card.querySelector('input[type="radio"]');
            if (!input) return;
            input.addEventListener('change', function () {
                const groupName = input.name;
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
                    const parentCard = radio.closest('[data-payment-card], [data-status-option]');
                    const icon = parentCard ? parentCard.querySelector('[data-radio-icon]') : null;
                    if (radio.checked) {
                        if (parentCard) parentCard.classList.add('is-selected');
                        if (icon) icon.alt = 'Dipilih';
                    } else {
                        if (parentCard) parentCard.classList.remove('is-selected');
                        if (icon) icon.alt = 'Belum dipilih';
                    }
                });
            });
        });
    }

    function resetPaymentSelections() {
        document.querySelectorAll('[data-payment-card], [data-status-option]').forEach(card => {
            card.classList.remove('is-selected');
            const icon = card.querySelector('[data-radio-icon]');
            if (icon) icon.alt = 'Belum dipilih';
        });
    }

    wireRadioCardGroup('[data-payment-card]');
    wireRadioCardGroup('[data-status-option]');

    // --- SALIN NOMOR REKENING ---
    document.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const value = btn.getAttribute('data-copy');
            const span = btn.querySelector('span');
            const original = span ? span.textContent : '';

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(value).then(() => {
                    if (span) span.textContent = 'Tersalin!';
                    setTimeout(() => { if (span) span.textContent = original; }, 1500);
                });
            }
        });
    });

    // --- NAVBAR MOBILE ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isOpen));
            navLinks.classList.toggle('is-open', !isOpen);
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('is-open');
            });
        });
    }
});