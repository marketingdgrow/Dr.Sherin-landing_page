document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (navbar && navToggle && navMenu) {
        const closeNavMenu = () => {
            navbar.classList.remove("menu-open");
            navToggle.classList.remove("is-active");
            navToggle.setAttribute("aria-expanded", "false");
        };

        navToggle.addEventListener("click", () => {
            const isOpen = navbar.classList.toggle("menu-open");
            navToggle.classList.toggle("is-active", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeNavMenu);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 980) {
                closeNavMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeNavMenu();
            }
        });
    }

    const bubbleLayer = document.getElementById("heroBubbles");
    if (bubbleLayer) {
        const createBubble = (width, height) => {
            const bubble = document.createElement("span");
            bubble.className = "bubble";

            const size = Math.floor(Math.random() * 180) + 90;
            const left = Math.random() * (width - size);
            const top = Math.random() * (height - size);
            const duration = (Math.random() * 6 + 7).toFixed(2);
            const delay = (Math.random() * -8).toFixed(2);
            const xShift = `${Math.floor(Math.random() * 70) - 35}px`;
            const yShift = `${Math.floor(Math.random() * 100) - 120}px`;

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.max(0, left)}px`;
            bubble.style.top = `${Math.max(0, top)}px`;
            bubble.style.setProperty("--duration", `${duration}s`);
            bubble.style.setProperty("--delay", `${delay}s`);
            bubble.style.setProperty("--x-shift", xShift);
            bubble.style.setProperty("--y-shift", yShift);

            bubbleLayer.appendChild(bubble);
        };

        const renderBubbles = () => {
            bubbleLayer.innerHTML = "";
            const host = bubbleLayer.getBoundingClientRect();
            const maxWidth = Math.max(host.width, 360);
            const maxHeight = Math.max(host.height, 460);
            const bubbleCount = window.innerWidth < 768 ? 7 : 11;

            for (let i = 0; i < bubbleCount; i += 1) {
                createBubble(maxWidth, maxHeight);
            }
        };

        renderBubbles();
        window.addEventListener("resize", renderBubbles);
    }

    const revealItems = document.querySelectorAll(".reveal-on-scroll");
    const counters = document.querySelectorAll(".count-up");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    } else if (revealItems.length > 0) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
        );

        revealItems.forEach((item) => revealObserver.observe(item));
    }

    const galleryTrack = document.getElementById("clinicGalleryTrack");
    if (galleryTrack) {
        const slides = Array.from(galleryTrack.querySelectorAll(".clinic-gallery-slide"));
        const stackCards = Array.from(document.querySelectorAll(".clinic-gallery-stack .stack-card"));
        const gallerySlider = galleryTrack.closest(".clinic-gallery-slider");
        const prevButton = document.querySelector(".clinic-gallery-controls .prev");
        const nextButton = document.querySelector(".clinic-gallery-controls .next");
        const galleryReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const slideTransitionMs = galleryReducedMotion ? 0 : 1050;

        let activeIndex = 0;
        let autoPlayTimer = null;
        let isSliding = false;
        let slideReleaseTimer = null;
        let stackShiftTimer = null;

        const syncGallery = (nextIndex) => {
            if (slides.length === 0 || isSliding) {
                return;
            }

            const total = slides.length;
            const previousMappedIndex = total - 1 - activeIndex;
            const safeIndex = (nextIndex + total) % total;
            activeIndex = safeIndex;
            isSliding = true;

            galleryTrack.style.transform = `translateX(-${safeIndex * 100}%)`;

            slides.forEach((slide, index) => {
                slide.classList.toggle("is-active", index === safeIndex);
            });

            const currentMappedIndex = total - 1 - safeIndex;
            stackCards.forEach((card, index) => {
                card.classList.remove("is-shift-out");
                card.classList.toggle("is-current", index === currentMappedIndex);
            });

            if (stackCards.length > 0 && previousMappedIndex !== currentMappedIndex) {
                const outgoingCard = stackCards[previousMappedIndex];
                outgoingCard?.classList.add("is-shift-out");

                if (stackShiftTimer) {
                    clearTimeout(stackShiftTimer);
                }

                stackShiftTimer = window.setTimeout(() => {
                    outgoingCard?.classList.remove("is-shift-out");
                }, Math.max(300, slideTransitionMs * 0.62));
            }

            if (slideReleaseTimer) {
                clearTimeout(slideReleaseTimer);
            }

            slideReleaseTimer = window.setTimeout(() => {
                isSliding = false;
            }, slideTransitionMs + 120);
        };

        const stopAutoPlay = () => {
            if (!autoPlayTimer) {
                return;
            }

            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        };

        const startAutoPlay = () => {
            if (galleryReducedMotion || slides.length < 2) {
                return;
            }

            stopAutoPlay();
            autoPlayTimer = window.setInterval(() => {
                syncGallery(activeIndex + 1);
            }, 4200);
        };

        const goNext = () => {
            syncGallery(activeIndex + 1);
            startAutoPlay();
        };

        const goPrev = () => {
            syncGallery(activeIndex - 1);
            startAutoPlay();
        };

        prevButton?.addEventListener("click", goPrev);
        nextButton?.addEventListener("click", goNext);
        stackCards.forEach((card, index) => {
            card.addEventListener("click", () => {
                const total = slides.length;
                syncGallery(total - 1 - index);
                startAutoPlay();
            });
        });

        if (gallerySlider) {
            gallerySlider.addEventListener("mouseenter", stopAutoPlay);
            gallerySlider.addEventListener("mouseleave", startAutoPlay);
            gallerySlider.addEventListener("touchstart", stopAutoPlay, { passive: true });
            gallerySlider.addEventListener("touchend", startAutoPlay);
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAutoPlay();
                return;
            }

            startAutoPlay();
        });

        syncGallery(0);
        isSliding = false;
        startAutoPlay();
    }

    const storyTrack = document.getElementById("storyTrack");
    if (storyTrack) {
        const storySlides = Array.from(storyTrack.querySelectorAll(".story-slide"));
        const storyVideos = storySlides.map((slide) => slide.querySelector(".story-video"));
        const storyPlayButtons = storySlides.map((slide) => slide.querySelector(".story-play-btn"));
        const storyDots = Array.from(document.querySelectorAll(".story-dot"));
        const storyPrevButton = document.querySelector(".success-stories-controls .prev");
        const storyNextButton = document.querySelector(".success-stories-controls .next");
        const storyReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const storyTransitionMs = storyReducedMotion ? 0 : 780;
        const totalStories = storySlides.length;

        let activeStoryIndex = 0;
        let storyIsSliding = false;
        let storySlideReleaseTimer = null;

        const hasStorySource = (video) => {
            if (!video) {
                return false;
            }

            if (video.currentSrc && video.currentSrc.trim() !== "") {
                return true;
            }

            const sourceNode = video.querySelector("source[src]");
            if (!sourceNode) {
                return false;
            }

            const srcValue = sourceNode.getAttribute("src") || "";
            return srcValue.trim() !== "";
        };

        const setStoryPlayButtonState = (index, isHidden) => {
            const button = storyPlayButtons[index];
            if (!button) {
                return;
            }

            button.classList.toggle("is-hidden", isHidden);
        };

        const normalizeStoryIndex = (index) => {
            if (totalStories === 0) {
                return 0;
            }

            return (index + totalStories) % totalStories;
        };

        const getStoryOffset = (index) => {
            let offset = index - activeStoryIndex;
            if (offset > totalStories / 2) {
                offset -= totalStories;
            }
            if (offset < -totalStories / 2) {
                offset += totalStories;
            }
            return offset;
        };

        const playStoryVideo = (index) => {
            const video = storyVideos[index];
            if (!video || index !== activeStoryIndex || !hasStorySource(video)) {
                return;
            }

            video.muted = false;
            video.loop = false;
            const playPromise = video.play();
            setStoryPlayButtonState(index, true);

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    setStoryPlayButtonState(index, false);
                });
            }
        };

        const updateStoryUi = (index) => {
            storySlides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            storyDots.forEach((dot, dotIndex) => {
                const isCurrent = dotIndex === index;
                dot.classList.toggle("is-active", isCurrent);
                dot.setAttribute("aria-current", isCurrent ? "true" : "false");
            });
        };

        const syncStoryLayout = (options = {}) => {
            const { resetInactive = true } = options;
            storySlides.forEach((slide, index) => {
                const offset = getStoryOffset(index);
                const isCenter = offset === 0;
                const isLeft = offset === -1;
                const isRight = offset === 1;
                const video = storyVideos[index];

                slide.classList.remove("pos-left", "pos-center", "pos-right", "is-hidden");

                if (isCenter) {
                    slide.classList.add("pos-center");
                } else if (isLeft) {
                    slide.classList.add("pos-left");
                } else if (isRight) {
                    slide.classList.add("pos-right");
                } else {
                    slide.classList.add("is-hidden");
                }

                if (!video) {
                    return;
                }

                if (isCenter) {
                    video.controls = true;
                    video.muted = false;
                    video.loop = false;

                    if (video.paused) {
                        setStoryPlayButtonState(index, false);
                    }
                    return;
                }

                video.controls = false;
                video.muted = true;
                video.loop = true;
                setStoryPlayButtonState(index, true);

                if (resetInactive) {
                    video.currentTime = 0;
                }

                if (isLeft || isRight) {
                    if (hasStorySource(video)) {
                        const previewPlay = video.play();
                        if (previewPlay && typeof previewPlay.catch === "function") {
                            previewPlay.catch(() => {});
                        }
                    }
                    return;
                }

                video.pause();
            });
        };

        const moveToStory = (nextIndex, options = {}) => {
            const { autoPlayCenter = false, resetInactive = true } = options;
            if (storySlides.length === 0 || storyIsSliding) {
                return;
            }

            activeStoryIndex = normalizeStoryIndex(nextIndex);
            storyIsSliding = true;

            updateStoryUi(activeStoryIndex);
            syncStoryLayout({ resetInactive });

            if (autoPlayCenter) {
                window.setTimeout(() => {
                    playStoryVideo(activeStoryIndex);
                }, storyTransitionMs > 0 ? storyTransitionMs * 0.62 : 0);
            }

            if (storySlideReleaseTimer) {
                clearTimeout(storySlideReleaseTimer);
            }

            storySlideReleaseTimer = window.setTimeout(() => {
                storyIsSliding = false;
            }, storyTransitionMs + 90);
        };

        storyPrevButton?.addEventListener("click", () => {
            moveToStory(activeStoryIndex - 1);
        });

        storyNextButton?.addEventListener("click", () => {
            moveToStory(activeStoryIndex + 1);
        });

        storyDots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                moveToStory(dotIndex);
            });
        });

        storyPlayButtons.forEach((button, buttonIndex) => {
            button?.addEventListener("click", () => {
                if (buttonIndex !== activeStoryIndex) {
                    moveToStory(buttonIndex, { autoPlayCenter: true, resetInactive: false });
                    return;
                }

                playStoryVideo(activeStoryIndex);
            });
        });

        storyVideos.forEach((video, videoIndex) => {
            if (!video) {
                return;
            }

            video.addEventListener("play", () => {
                setStoryPlayButtonState(videoIndex, true);
            });

            video.addEventListener("pause", () => {
                if (!video.ended && videoIndex === activeStoryIndex) {
                    setStoryPlayButtonState(videoIndex, false);
                }
            });

            video.addEventListener("ended", () => {
                setStoryPlayButtonState(videoIndex, false);

                if (videoIndex !== activeStoryIndex) {
                    return;
                }

                moveToStory(activeStoryIndex + 1, { autoPlayCenter: true, resetInactive: true });
            });
        });

        updateStoryUi(0);
        syncStoryLayout({ resetInactive: false });
    }

    const setCounterValue = (counter, value) => {
        const suffix = counter.dataset.suffix || "";
        counter.textContent = `${value}${suffix}`;
    };

    const animateCounter = (counter) => {
        if (counter.dataset.done === "1") {
            return;
        }

        const target = Number(counter.dataset.target || 0);
        const duration = Number(counter.dataset.duration || 1500);
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            const current = Math.floor(target * eased);
            setCounterValue(counter, current);

            if (progress < 1) {
                requestAnimationFrame(step);
                return;
            }

            setCounterValue(counter, target);
            counter.dataset.done = "1";
        };

        requestAnimationFrame(step);
    };

    if (counters.length === 0) {
        return;
    }

    if (reducedMotion) {
        counters.forEach((counter) => {
            setCounterValue(counter, Number(counter.dataset.target || 0));
            counter.dataset.done = "1";
        });
        return;
    }

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.55 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
});


let topBtn = document.getElementById("topBtn");

window.onscroll = function(){
  if(document.body.scrollTop > 200 || document.documentElement.scrollTop > 200){
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
}

function scrollToTop(){
  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}
