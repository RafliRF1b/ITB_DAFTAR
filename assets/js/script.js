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

// ### NAVBAR
// Navbar Fixed
const navMenu = document.querySelector('#nav-menu');

function updateNavbar() {
  const header = document.querySelector("#navbar");

  if (window.scrollY <= 400) {
    header.classList.remove("navbar-fixed");
    header.classList.add("navbar-absolute");
    header.style.transform = "translateY(0)";
    header.style.opacity = "1";
  } else if (window.scrollY <= 600) {
    header.style.transform = "translateY(-10px)";
    header.style.opacity = "0";
    navMenu.classList.remove("dropdown-appear");
    navMenu.classList.add("hidden");
  } else {
    header.classList.add("navbar-fixed");
    header.classList.remove("navbar-absolute");
    header.style.transform = "translateY(0)";
    header.style.opacity = "1";
  }
}

window.addEventListener("scroll", updateNavbar);
updateNavbar();

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
document.addEventListener("DOMContentLoaded", function () {
    
// 1. AUTO DUPLICATE UNTUK ANIMATION LOOP SEAMLESS
function setupInfiniteTrack(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;
    
    const children = Array.from(track.children);
    children.forEach(child => {
        const clone = child.cloneNode(true);
        track.appendChild(clone);
    });
}

setupInfiniteTrack("slide-track-1");
setupInfiniteTrack("slide-track-2");

// 2. LOGIC POPUP & SLIDER BARIS 1 (AGATE)
const track1 = document.getElementById("slide-track-1");
const imagesBaris1 = Array.from(track1.querySelectorAll(".image"));
const popup1 = document.getElementById("popup-1");
const closeBtn1 = document.getElementById("close-btn-1");
const largeImage1 = document.getElementById("large-image-1");
const imageIndex1 = document.getElementById("index-1");
const leftArrow1 = document.getElementById("left-arrow-1");
const rightArrow1 = document.getElementById("right-arrow-1");

let currentIdx1 = 0;
const uniqueSources1 = Array.from(new Set(imagesBaris1.map(img => img.src)));

function updatePopup1(index) {
    currentIdx1 = (index + uniqueSources1.length) % uniqueSources1.length;
    largeImage1.src = uniqueSources1[currentIdx1];
    imageIndex1.textContent = String(currentIdx1 + 1).padStart(2, '0');
}

// track1.addEventListener("click", function (e) {
//     const clickedSlide = e.target.closest(".slide");
//     if (!clickedSlide) return;

//     const img = clickedSlide.querySelector("img");
//     if (img) {
//         const originalIndex = uniqueSources1.indexOf(img.src);
//         updatePopup1(originalIndex !== -1 ? originalIndex : 0);
//         popup1.classList.add("active");
//     }
// });

closeBtn1.addEventListener("click", () => popup1.classList.remove("active"));
leftArrow1.addEventListener("click", () => updatePopup1(currentIdx1 - 1));
rightArrow1.addEventListener("click", () => updatePopup1(currentIdx1 + 1));


// 3. LOGIC POPUP & SLIDER BARIS 2 (HGTC)
const track2 = document.getElementById("slide-track-2");
const imagesBaris2 = Array.from(track2.querySelectorAll(".image-2"));
const popup2 = document.getElementById("popup-2");
const closeBtn2 = document.getElementById("close-btn-2");
const largeImage2 = document.getElementById("large-image-2");
const imageIndex2 = document.getElementById("index-2");
const leftArrow2 = document.getElementById("left-arrow-2");
const rightArrow2 = document.getElementById("right-arrow-2");

let currentIdx2 = 0;
const uniqueSources2 = Array.from(new Set(imagesBaris2.map(img => img.src)));

function updatePopup2(index) {
    currentIdx2 = (index + uniqueSources2.length) % uniqueSources2.length;
    largeImage2.src = uniqueSources2[currentIdx2];
    imageIndex2.textContent = String(currentIdx2 + 1).padStart(2, '0');
}

// track2.addEventListener("click", function (e) {
//     const clickedSlide = e.target.closest(".slide");
//     if (!clickedSlide) return;

//     const img = clickedSlide.querySelector("img");
//     if (img) {
//         const originalIndex = uniqueSources2.indexOf(img.src);
//         updatePopup2(originalIndex !== -1 ? originalIndex : 0);
//         popup2.classList.add("active-2");
//     }
// });

closeBtn2.addEventListener("click", () => popup2.classList.remove("active-2"));
leftArrow2.addEventListener("click", () => updatePopup2(currentIdx2 - 1));
rightArrow2.addEventListener("click", () => updatePopup2(currentIdx2 + 1));

// Tutup popup dengan tombol Esc
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        popup1.classList.remove("active");
        popup2.classList.remove("active-2");
    }
});
});

// UPLOAD FILE
  document.addEventListener("DOMContentLoaded", function () {
	const fileInput = document.getElementById("bukti_pembayaran") || document.getElementById("payment_proof");
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