document.addEventListener('DOMContentLoaded', function() {

    // 1. Scroll-triggered fade-in animation
    const animatedCards = document.querySelectorAll('.animated-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedCards.forEach(card => {
        observer.observe(card);
    });


    // 2. "Back to Top" button functionality
    const backToTopButton = document.getElementById('backToTopBtn');

    window.onscroll = function() {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    };

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    
    // 3. Smooth scrolling for Table of Contents links (UPDATED)
    document.querySelectorAll('.toc-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if(targetElement) {
                // The scroll-padding-top in CSS handles the offset now.
                // For direct JS control, you can use the method below.
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - 80; // 70px header + 10px margin

                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            }
        });
    });

});