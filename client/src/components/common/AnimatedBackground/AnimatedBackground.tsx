import { useEffect, useState } from 'react';
import styles from './AnimatedBackground.module.css';

interface Star {
  id: number;
  size: number;
  top: string;
  left: string;
  duration: string;
  delay: string;
  opacity: number;
}

interface ShootingStar {
  id: number;
  top: string;
  left: string;
  angle: string;
  duration: string;
  delay: string;
}

interface Nebula {
  id: number;
  size: number;
  top: string;
  left: string;
  color: string;
}

export const AnimatedBackground = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [nebulae, setNebulae] = useState<Nebula[]>([]);

  useEffect(() => {
    // Generate stars
    const newStars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        id: i,
        size: Math.random() * 2 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: `${Math.random() * 3 + 2}s`,
        delay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }
    setStars(newStars);

    // Generate shooting stars
    const newShootingStars: ShootingStar[] = [];
    for (let i = 0; i < 5; i++) {
      newShootingStars.push({
        id: i,
        top: `${Math.random() * 50}%`,
        left: '0',
        angle: `${Math.random() * 20 - 10}deg`,
        duration: `${Math.random() * 5 + 10}s`,
        delay: `${Math.random() * 15}s`,
      });
    }
    setShootingStars(newShootingStars);

    // Generate nebulae
    const colors = [
      'var(--accent-1)',
      'var(--accent-2)',
      'var(--accent-3)',
      'var(--secondary-main)',
      'var(--secondary-dark)',
    ];
    
    const newNebulae: Nebula[] = [];
    for (let i = 0; i < 5; i++) {
      newNebulae.push({
        id: i,
        size: Math.random() * 300 + 200,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setNebulae(newNebulae);
  }, []);

  return (
    <div className={styles.background}>
      {nebulae.map((nebula) => (
        <div
          key={`nebula-${nebula.id}`}
          className={styles.nebula}
          style={{
            width: `${nebula.size}px`,
            height: `${nebula.size}px`,
            top: nebula.top,
            left: nebula.left,
            '--color': nebula.color,
          } as React.CSSProperties}
        />
      ))}
      
      <div className={styles.stars}>
        {stars.map((star) => (
          <div
            key={`star-${star.id}`}
            className={styles.star}
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              '--duration': star.duration,
              '--delay': star.delay,
              '--opacity': star.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {shootingStars.map((shootingStar) => (
        <div
          key={`shooting-star-${shootingStar.id}`}
          className={styles.shootingStar}
          style={{
            top: shootingStar.top,
            left: shootingStar.left,
            '--angle': shootingStar.angle,
            '--duration': shootingStar.duration,
            '--delay': shootingStar.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
