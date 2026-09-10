window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    // Tunggu sebentar setelah halaman selesai dimuat, lalu sembunyikan preloader
    setTimeout(() => {
        preloader.classList.add('preloader-hidden');
    }, 500); // Waktu tunggu 0.5 detik untuk efek lebih halus
});

// Mencegah Inspect Element dan View Source
document.addEventListener("keydown", function (event) {
  if (
    (event.ctrlKey &&
      (event.key === "u" ||
        event.key === "i" ||
        event.key === "j" ||
        event.key === "s")) ||
    (event.ctrlKey &&
      event.shiftKey &&
      (event.key === "I" || event.key === "J" || event.key === "C")) ||
    event.key === "F12"
  ) {
    event.preventDefault();
    console.log("Inspect Element telah dinonaktifkan!"); // Debugging
  }
});
// Mencegah Klik Kanan
document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});
// Mencegah Drag & Drop pada Semua Gambar
document.addEventListener("dragstart", function (event) {
  event.preventDefault();
});
// Mencegah Klik Kanan pada Gambar Secara Spesifik
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("contextmenu", (event) => event.preventDefault());
});

const menuIcon = document.getElementById("menu-icon");
const menuList = document.getElementById("menu-list");

// Toggle buka/tutup menu (halaman lama, mis. daftar.html)
if (menuIcon && menuList) {
  menuIcon.addEventListener("click", () => {
    menuList.classList.toggle("active");
  });

  // Tutup menu saat link diklik (khusus mobile)
  document.querySelectorAll("#menu-list a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      if (href.startsWith("#")) {
        e.preventDefault(); // hanya cegah scroll instan untuk anchor dalam halaman
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }

      // Setelah klik, tutup menu jika mobile
      if (window.innerWidth <= 1024) {
        menuList.classList.remove("active");
      }
    });
  });
}

// NAVBAR BARU (IT Bootcamp 2026 - Independent Project / itb-home.html)
// Toggle buka/tutup menu untuk #hamburgerBtn + #mainNav
(function () {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  if (!btn || !nav) return;

  function closeMenu() {
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  }
  function toggleMenu() {
    const isOpen = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  btn.addEventListener("click", toggleMenu);

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) closeMenu();
  });
})();



// LIVE HERO SECTION
document.addEventListener("DOMContentLoaded", function () {
  const liveHero = document.querySelector(".live-hero");
  const items = Array.from(document.querySelectorAll(".live-hero .live"));

  // Duplikasi elemen agar animasi berjalan tanpa jeda
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    liveHero.appendChild(clone);
  });
});

// DOKUMENTASI SECTION
document.querySelectorAll('.slider-track').forEach(track => {
  track.innerHTML += track.innerHTML; // Gandakan isi track
});

function openPopup(imageSrc) {
  const popup = document.getElementById("popup");
  const popupImage = document.getElementById("popup-image");
  popupImage.src = imageSrc;
  popup.style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// UPLOAD FILE
  document.addEventListener("DOMContentLoaded", function () {
	const fileInput = document.getElementById("payment_proof");
	const uploadSuccess = document.getElementById("upload-success");
	const changeFileButton = document.getElementById("change-file-button");
	const uploadLabel = document.getElementById("upload-label");

	if (!fileInput || !uploadSuccess || !changeFileButton || !uploadLabel) return;

	fileInput.addEventListener("change", function () {
		if (fileInput.files.length > 0) {
			uploadSuccess.style.display = "inline";
			changeFileButton.style.display = "inline-block";
			uploadLabel.style.display = "none";
		}
	});

	changeFileButton.addEventListener("click", function () {
		fileInput.click(); // Buka dialog pilih file lagi
	});
});