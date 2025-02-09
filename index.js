// const { default: Swiper } = require("swiper")

searchForm = document.querySelector(".search-form");

document.querySelector("#search-btn").onclick = () => {
	searchForm.classList.toggle("active");
};

let loginForm = document.querySelector(".login-form-container");
document.querySelector("#login-btn").onclick = () => {
	loginForm.classList.toggle("active");
};

document.querySelector("#close-login-btn").onclick = () => {
	loginForm.classList.remove("active");
};

window.onscroll = () => {
	searchForm.classList.remove("active");

	if (window.scrollY > 80) {
		document.querySelector(".header .header-2").classList.add("active");
	} else {
		document.querySelector(".header .header-2").classList.remove("active");
	}
};

window.onload = () => {
	if (window.scrollY > 80) {
		document.querySelector(".header .header-2").classList.add("active");
	} else {
		document.querySelector(".header .header-2").classList.remove("active");
	}
};
document.addEventListener("DOMContentLoaded", function () {
	var featuredswiper = new Swiper(".featured-slider", {
		slidesPerView: 3,
		spaceBetween: 10,
		loop: true,
		autoplay: {
			delay: 9500,
			disableOnInteraction: false,
		},
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},
		breakpoints: {
			0: { slidesPerView: 1 },
			450: { slidesPerView: 2 },
			768: { slidesPerView: 3 },
			1024: { slidesPerView: 4 },
		},
	});
});

// const imeniSliderswiper = new Swiper(".imeniSlider", {
// 	loop: true,
// 	autoplay: {
// 		delay: 3000,
// 	},
// 	pagination: {
// 		el: ".swiper-pagination",
// 		clickable: true,
// 	},
// });

// Swiper for Arrivals Section
// const arrivalsSwiper = new Swiper(".arrivals-slider", {
// 	slidesPerView: 3,
// 	spaceBetween: 30,
// 	loop: true,
// 	pagination: {
// 		el: ".swiper-pagination",
// 		clickable: true,
// 	},
// });

document.addEventListener("DOMContentLoaded", function () {
	// Arrivals Swiper
	const arrivalsSwiper = new Swiper(".arrivals-slider", {
		slidesPerView: 3,
		spaceBetween: 30,
		loop: true,
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
	});

	// Reviews Swiper
	const reviewsSwiper = new Swiper(".reviews-slider", {
		slidesPerView: 1, // Default view for small screens
		spaceBetween: 30,
		loop: true,
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
		breakpoints: {
			768: {
				slidesPerView: 2,
				spaceBetween: 20,
			},
			1024: {
				slidesPerView: 3,
				spaceBetween: 30,
			},
		},
	});
});

const bar = document.getElementById("bar");
const nav = document.getElementById("nav");
const close = document.getElementById("close");

if (bar) {
	bar.addEventListener("click", () => {
		nav.classList.add("active");
	});
}

if (close) {
	close.addEventListener("click", () => {
		nav.classList.remove("active");
	});
}

//
const sliders = document.querySelectorAll(".swiper");
sliders.forEach((slider) => {
	new Swiper(slider, {
		loop: true,
		spaceBetween: 20,
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
		breakpoints: {
			640: { slidesPerView: 1 },
			768: { slidesPerView: 2 },
			1024: { slidesPerView: 3 },
		},
	});
});

// document.addEventListener("DOMContentLoaded", function () {
// 	const toggleIcons = document.querySelectorAll(".toggle-icon");
// 	const navbar = document.querySelector(".navbar");

// 	// باز و بسته کردن ساب‌منو با کلیک
// 	toggleIcons.forEach((icon) => {
// 		icon.addEventListener("click", function (event) {
// 			event.preventDefault(); // جلوگیری از رفتار پیش‌فرض لینک
// 			const submenu = this.nextElementSibling; // پیدا کردن ساب‌منو مربوطه
// 			if (submenu && (submenu.classList.contains("submenu") || submenu.classList.contains("submenu-2"))) {
// 				submenu.classList.toggle("active");
// 			}
// 		});
// 	});

// 	// بستن ساب‌منو وقتی خارج از آن کلیک می‌شود
// 	document.addEventListener("click", function (event) {
// 		if (!navbar.contains(event.target)) {
// 			toggleIcons.forEach((icon) => {
// 				const submenu = icon.nextElementSibling;
// 				if (submenu && (submenu.classList.contains("submenu") || submenu.classList.contains("submenu-2"))) {
// 					submenu.classList.remove("active");
// 				}
// 			});
// 		}
// 	});
// });

document.addEventListener("DOMContentLoaded", function () {
	const toggleIcons = document.querySelectorAll(".toggle-icon");

	// باز و بسته کردن ساب‌منو با کلیک روی آیکون
	toggleIcons.forEach((icon) => {
		icon.addEventListener("click", function (event) {
			event.preventDefault(); // جلوگیری از رفتار پیش‌فرض
			event.stopPropagation(); // جلوگیری از انتشار رویداد به عناصر والد
			const submenu = this.nextElementSibling; // پیدا کردن ساب‌منو مربوطه
			if (submenu && (submenu.classList.contains("submenu") || submenu.classList.contains("submenu-2"))) {
				submenu.classList.toggle("active");
			}
		});
	});

	// بستن ساب‌منو وقتی خارج از آن کلیک می‌شود
	document.addEventListener("click", function (event) {
		toggleIcons.forEach((icon) => {
			const submenu = icon.nextElementSibling;
			if (submenu && (submenu.classList.contains("submenu") || submenu.classList.contains("submenu-2"))) {
				// بررسی کنید که آیا کلیک خارج از ساب‌منو و آیکون اتفاق افتاده است
				if (!icon.contains(event.target) && !submenu.contains(event.target)) {
					submenu.classList.remove("active");
				}
			}
		});
	});
});
