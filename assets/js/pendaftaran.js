document.addEventListener("DOMContentLoaded", function () {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwTKEjqNnQ68cmAQ3XFm26v34DjgYQf5YQgSnKx0WHO6LAC1erktEgV9_AqcENHDLkD/exec';

    const form = document.getElementById("formPendaftaran") || document.getElementById("form-pendaftaran-lomba");
    const btnSubmit = document.getElementById("btnSubmit") || (form ? form.querySelector('.submit') : null);
    const submitLabel = btnSubmit ? btnSubmit.querySelector('.retro-btn__label') : null;

    const fileInput = document.getElementById('bukti_pembayaran') || document.getElementById('payment_proof');
    const dropzone = document.getElementById('dropzone');
    const fileBtn = document.getElementById('fileBtn');
    const uploadLabel = document.getElementById('upload-label');
    const uploadSuccess = document.getElementById('upload-success');
    const uploadFilename = document.getElementById('upload-filename');
    const changeFileButton = document.getElementById('change-file-button');

    const loadingOverlay = document.getElementById('loading-overlay');
    const modal = document.getElementById('custom-modal');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseButton = document.getElementById('modal-close-button');

    const onlyNumberFields = ['no_telp', 'no_rek', 'nominal'];
    onlyNumberFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.setAttribute('inputmode', 'numeric');

        el.addEventListener('keydown', function (e) {
            if (
                ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) ||
                (e.ctrlKey || e.metaKey)
            ) {
                return;
            }
            if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        el.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '');
        });
    });

    const onlyTextFields = ['nama', 'nama_pengirim'];
    onlyTextFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('keydown', function (e) {
            if (/^[0-9]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        el.addEventListener('input', function () {
            this.value = this.value.replace(/[^a-zA-Z\s.,'’\-]/g, '');
        });
    });

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
    });

    function setSubmitState(isLoading) {
        if (btnSubmit) {
            btnSubmit.disabled = isLoading;
        }
        if (submitLabel) {
            submitLabel.textContent = isLoading ? 'Mengirim Data...' : 'KIRIM PENDAFTARAN';
        } else if (btnSubmit) {
            btnSubmit.innerText = isLoading ? 'Mengirim Data...' : 'Kirim Pendaftaran';
        }
        if (loadingOverlay) {
            loadingOverlay.style.display = isLoading ? 'flex' : 'none';
        }
    }

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const namaInput = document.getElementById('nama');
            const namaVal = namaInput ? namaInput.value.trim() : '';
            if (/\d/.test(namaVal)) {
                showModal('⚠️', 'Format Nama Tidak Sesuai', 'Nama Lengkap hanya boleh berupa huruf dan spasi.');
                if (namaInput) namaInput.focus();
                return;
            }

            const noTelpInput = document.getElementById('no_telp');
            const noTelpVal = noTelpInput ? noTelpInput.value.trim() : '';
            if (!/^\d+$/.test(noTelpVal)) {
                showModal('⚠️', 'Format No Telp Tidak Sesuai', 'Nomor telepon hanya boleh berupa angka.');
                if (noTelpInput) noTelpInput.focus();
                return;
            }

            const namaPengirimInput = document.getElementById('nama_pengirim');
            const namaPengirimVal = namaPengirimInput ? namaPengirimInput.value.trim() : '';
            if (/\d/.test(namaPengirimVal)) {
                showModal('⚠️', 'Format Nama Pengirim Tidak Sesuai', 'Nama Pengirim hanya boleh berupa huruf dan spasi.');
                if (namaPengirimInput) namaPengirimInput.focus();
                return;
            }

            const noRekInput = document.getElementById('no_rek');
            const noRekVal = noRekInput ? noRekInput.value.trim() : '';
            if (!/^\d+$/.test(noRekVal)) {
                showModal('⚠️', 'Format No Rekening Tidak Sesuai', 'Nomor rekening/DANA hanya boleh berupa angka.');
                if (noRekInput) noRekInput.focus();
                return;
            }

            const nominalInput = document.getElementById('nominal');
            const nominalVal = nominalInput ? nominalInput.value.trim() : '';
            if (!/^\d+$/.test(nominalVal)) {
                showModal('⚠️', 'Format Nominal Tidak Sesuai', 'Nominal pembayaran hanya boleh berupa angka.');
                if (nominalInput) nominalInput.focus();
                return;
            }

            const file = fileInput && fileInput.files ? fileInput.files[0] : null;
            if (!file) {
                showModal('⚠️', 'Bukti Pembayaran Diperlukan', 'Silakan pilih atau unggah bukti transfer pembayaran Anda.');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showModal('❌', 'Ukuran File Terlalu Besar', 'Maksimal ukuran file bukti pembayaran adalah 5 MB.');
                return;
            }

            const paymentRadio = document.querySelector('input[name="metode_pembayaran"]:checked') || document.querySelector('input[name="payment_method"]:checked');
            const metodePembayaran = paymentRadio ? paymentRadio.value : (document.getElementById('metode_pembayaran')?.value || '');

            const statusRadio = document.querySelector('input[name="status_pembayaran"]:checked');
            const statusPembayaran = statusRadio ? statusRadio.value : (document.getElementById('status_pembayaran')?.value || '');

            if (!metodePembayaran) {
                showModal('⚠️', 'Metode Pembayaran Kosong', 'Silakan pilih salah satu metode pembayaran yang tersedia (DANA / SeaBank).');
                return;
            }

            if (!statusPembayaran) {
                showModal('⚠️', 'Status Pembayaran Kosong', 'Silakan tentukan status pembayaran Anda (DP atau Lunas).');
                return;
            }

            const npmInput = document.getElementById('npm');
            const npmVal = npmInput ? npmInput.value.trim() : '';

            setSubmitState(true);

            try {
                const fileBase64 = await fileToBase64(file);
                const fileName = `${npmVal}_${file.name}`;
                const fileMimeType = file.type || 'image/jpeg';

                const payload = {
                    nama: namaVal,
                    npm: npmVal,
                    email: (document.getElementById('email')?.value || '').trim(),
                    no_telp: noTelpVal,
                    kelas: (document.getElementById('kelas')?.value || '').trim(),
                    kelompok: (document.getElementById('kelompok')?.value || '').trim(),
                    metode_pembayaran: metodePembayaran,
                    nama_pengirim: namaPengirimVal,
                    no_rek: noRekVal,
                    nominal: nominalVal,
                    tgl_pembayaran: document.getElementById('tgl_pembayaran')?.value || '',
                    status_pembayaran: statusPembayaran,
                    fileData: fileBase64,
                    fileName: fileName,
                    fileMimeType: fileMimeType
                };

                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (result.result === 'success' || result.status === 'success') {
                    form.reset();
                    resetUploadUI();
                    resetPaymentSelections();
                    showModal('✅', 'Pendaftaran Berhasil!', 'Data pendaftaran dan bukti pembayaran berhasil dikirim dan tersimpan di sistem.');
                } else {
                    showModal('❌', 'Gagal Mengirim Data', result.error || result.message || 'Terjadi kendala saat memproses data pendaftaran.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                showModal('❌', 'Kesalahan Koneksi', 'Terjadi kesalahan koneksi saat mengirim data. Pastikan internet Anda aktif dan silakan coba lagi.');
            } finally {
                setSubmitState(false);
            }
        });
    }

    function showModal(icon, title, message) {
        if (!modal) {
            alert(`${title}\n${message}`);
            return;
        }
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

    function showUploadedState(filename) {
        if (uploadLabel) uploadLabel.style.display = 'none';
        if (uploadSuccess) uploadSuccess.style.display = 'flex';
        if (uploadFilename) uploadFilename.textContent = filename;
    }

    function resetUploadUI() {
        if (uploadLabel) uploadLabel.style.display = 'flex';
        if (uploadSuccess) uploadSuccess.style.display = 'none';
        if (uploadFilename) uploadFilename.textContent = '';
        if (fileInput) fileInput.value = '';
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

    function wireRadioCardGroup(selector) {
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            const input = card.querySelector('input[type="radio"]');
            if (!input) return;
            input.addEventListener('change', function () {
                const groupName = input.name;

                const hiddenEl = document.getElementById(groupName);
                if (hiddenEl && hiddenEl.type === 'hidden') {
                    hiddenEl.value = input.value;
                }

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
        const hiddenMetode = document.getElementById('metode_pembayaran');
        if (hiddenMetode && hiddenMetode.type === 'hidden') hiddenMetode.value = '';
        const hiddenStatus = document.getElementById('status_pembayaran');
        if (hiddenStatus && hiddenStatus.type === 'hidden') hiddenStatus.value = '';
    }

    wireRadioCardGroup('[data-payment-card]');
    wireRadioCardGroup('[data-status-option]');

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