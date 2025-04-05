import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './ImageCarousel.module.css';

interface Slide {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface ImageCarouselProps {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

export const ImageCarousel = ({
  slides,
  autoPlay = true,
  interval = 5000,
}: ImageCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentSlide(index);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning]);

  const goToNextSlide = useCallback(() => {
    const nextSlide = (currentSlide + 1) % slides.length;
    goToSlide(nextSlide);
  }, [currentSlide, slides.length, goToSlide]);

  const goToPrevSlide = useCallback(() => {
    const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevSlide);
  }, [currentSlide, slides.length, goToSlide]);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      goToNextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, goToNextSlide]);

  console.log('Rendering ImageCarousel with slides:', slides);

  return (
    <div className={styles.carousel}>
      <div
        className={styles.slideContainer}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={styles.slide}
            style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1 }}
          >
            <div className={styles.slideOverlay}>
              <h2 className={styles.slideTitle}>{slide.title}</h2>
              <p className={styles.slideDescription}>{slide.description}</p>
              <Link to={slide.buttonLink} className={styles.slideButton}>
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        {slides.map((_, index) => (
          <div
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      <button
        className={`${styles.arrowButton} ${styles.prevButton}`}
        onClick={goToPrevSlide}
        aria-label="Previous slide"
      >
        &#10094;
      </button>
      <button
        className={`${styles.arrowButton} ${styles.nextButton}`}
        onClick={goToNextSlide}
        aria-label="Next slide"
      >
        &#10095;
      </button>
    </div>
  );
};
