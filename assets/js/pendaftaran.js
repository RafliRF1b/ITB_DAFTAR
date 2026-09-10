document.addEventListener("DOMContentLoaded", function () {
    // --- ELEMEN FORM ---
    const form = document.getElementById("form-pendaftaran-lomba");
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzixPGe1q87iXZ_3bcX3AR52Edit14J5_u8QlOUmekTahBPtZ-NPJfpkhFFCnTzEgO7Gw/exec'; // URL Web App Anda
    const submitButton = form.querySelector('.submit');
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

    // Helper untuk mengubah label tombol submit (retro-btn pakai <span>, bukan value)
    function setSubmitLabel(text) {
        if (submitLabel) {
            submitLabel.textContent = text;
        } else if (submitButton) {
            submitButton.value = text;
        }
    }

    // Event listener utama saat form disubmit
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        loadingOverlay.style.display = 'flex'; // Tampilkan animasi loading
        submitButton.disabled = true;
        setSubmitLabel("Mengirim...");

        const formData = new FormData(form);
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                formData.delete('payment_proof');
                formData.append('payment_proof_base64', reader.result);
                formData.append('payment_proof_filename', file.name);
                sendData(formData); // Kirim data setelah file dibaca
            };
            reader.onerror = (error) => {
                loadingOverlay.style.display = 'none';
                submitButton.disabled = false;
                setSubmitLabel("KIRIM PENDAFTARAN");
                showModal('❌', 'Gagal', 'Terjadi kesalahan saat membaca file. Silakan coba lagi.');
            };
        } else {
            sendData(formData); // Langsung kirim jika tidak ada file
        }
    });

    // Fungsi untuk mengirim data ke Google Apps Script
    function sendData(formData) {
        fetch(scriptURL, { method: "POST", body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    form.reset();
                    resetUploadUI();
                    resetPaymentSelections();
                    showModal('✅', 'Berhasil Terkirim!', data.message);
                } else {
                    showModal('❌', 'Gagal!', data.message);
                }
            })
            .catch(error => {
                console.error("Error!", error.message);
                showModal('❌', 'Error Jaringan', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.');
            })
            .finally(() => {
                loadingOverlay.style.display = 'none'; // Sembunyikan loading
                submitButton.disabled = false;
                setSubmitLabel("KIRIM PENDAFTARAN");
            });
    }

    // --- FUNGSI UNTUK MODAL & UI ---
    function showModal(icon, title, message) {
        modalIcon.textContent = icon;
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10); // Memicu animasi fade-in
    }

    function hideModal() {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300); // Tunggu animasi selesai
    }

    // Event listener untuk menutup modal
    modalCloseButton.addEventListener('click', hideModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) { // Tutup jika klik di luar box
            hideModal();
        }
    });

    // --- LOGIKA UPLOAD FILE (drag & drop + klik) ---
    function showUploadedState(filename) {
        uploadLabel.style.display = 'none';
        uploadSuccess.style.display = 'flex';
        if (uploadFilename) uploadFilename.textContent = filename;
    }

    function resetUploadUI() {
        uploadLabel.style.display = 'flex';
        uploadSuccess.style.display = 'none';
        if (uploadFilename) uploadFilename.textContent = '';
    }

    if (fileBtn) {
        fileBtn.addEventListener('click', function () {
            fileInput.click();
        });
    }

    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            showUploadedState(this.files[0].name);
        }
    });

    if (changeFileButton) {
        changeFileButton.addEventListener('click', function () {
            fileInput.click();
        });
    }

    if (dropzone) {
        ['dragenter', 'dragover'].forEach(function (evt) {
            dropzone.addEventListener(evt, function (e) {
                e.preventDefault();
                dropzone.classList.add('is-dragover');
            });
        });
        ['dragleave', 'drop'].forEach(function (evt) {
            dropzone.addEventListener(evt, function (e) {
                e.preventDefault();
                dropzone.classList.remove('is-dragover');
            });
        });
        dropzone.addEventListener('drop', function (e) {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                showUploadedState(e.dataTransfer.files[0].name);
            }
        });
    }

    // --- LOGIKA PILIHAN KARTU RADIO (Metode Pembayaran & Status Pembayaran) ---
    const SELECTED_ICON = 'https://www.figma.com/api/mcp/asset/cc524ac3-ed04-4d0a-87a5-ef31d7b331f6.svg';
    const UNSELECTED_ICON = 'https://www.figma.com/api/mcp/asset/1c496614-f05c-4ed1-99ee-d5edec605a59.svg';

    function wireRadioCardGroup(selector) {
        const cards = document.querySelectorAll(selector);
        cards.forEach(function (card) {
            const input = card.querySelector('input[type="radio"]');
            if (!input) return;
            input.addEventListener('change', function () {
                const groupName = input.name;
                document.querySelectorAll('input[name="' + groupName + '"]').forEach(function (radio) {
                    const parentCard = radio.closest('[data-payment-card], [data-status-option]');
                    const icon = parentCard ? parentCard.querySelector('[data-radio-icon]') : null;
                    if (radio.checked) {
                        if (parentCard) parentCard.classList.add('is-selected');
                        if (icon) { icon.src = SELECTED_ICON; icon.alt = 'Dipilih'; }
                    } else {
                        if (parentCard) parentCard.classList.remove('is-selected');
                        if (icon) { icon.src = UNSELECTED_ICON; icon.alt = 'Belum dipilih'; }
                    }
                });
            });
        });
    }

    function resetPaymentSelections() {
        document.querySelectorAll('[data-payment-card], [data-status-option]').forEach(function (card) {
            card.classList.remove('is-selected');
            const icon = card.querySelector('[data-radio-icon]');
            if (icon) { icon.src = UNSELECTED_ICON; icon.alt = 'Belum dipilih'; }
        });
    }

    wireRadioCardGroup('[data-payment-card]');
    wireRadioCardGroup('[data-status-option]');

    // --- SALIN NOMOR REKENING/DANA ---
    document.querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const value = btn.getAttribute('data-copy');
            const original = btn.querySelector('span') ? btn.querySelector('span').textContent : '';
            const restore = () => { if (btn.querySelector('span')) btn.querySelector('span').textContent = original; };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(value).then(function () {
                    if (btn.querySelector('span')) btn.querySelector('span').textContent = 'Tersalin!';
                    setTimeout(restore, 1500);
                }).catch(function () {
                    /* diamkan jika clipboard tidak tersedia */
                });
            }
        });
    });

    // --- TOGGLE MENU NAVBAR (mobile) ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isOpen));
            navLinks.classList.toggle('is-open', !isOpen);
        });
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('is-open');
            });
        });
    }
});
