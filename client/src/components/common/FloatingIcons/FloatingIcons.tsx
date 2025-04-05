import { useEffect, useState } from 'react';
import styles from './FloatingIcons.module.css';

interface FloatingIcon {
  id: number;
  icon: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

export const FloatingIcons = () => {
  const [icons, setIcons] = useState<FloatingIcon[]>([]);

  useEffect(() => {
    // Lista de emojis de deportes
    const sportEmojis = [
      '⚽', '🏀', '🎾', '⚾', '🏐', '🏈', '🏉', '🎯', '🏆', '🏅', 
      '🥇', '🥈', '🥉', '⛳', '🏄', '🏊', '🚴', '🤸', '⛷️', '🏂'
    ];

    // Crear iconos flotantes
    const newIcons: FloatingIcon[] = [];
    for (let i = 0; i < 15; i++) {
      newIcons.push({
        id: i,
        icon: sportEmojis[Math.floor(Math.random() * sportEmojis.length)],
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 1.5 + 1}rem`,
        duration: `${Math.random() * 20 + 10}s`,
        delay: `${Math.random() * 10}s`,
      });
    }
    setIcons(newIcons);
  }, []);

  return (
    <div className={styles.container}>
      {icons.map((icon) => (
        <div
          key={icon.id}
          className={styles.icon}
          style={{
            left: icon.left,
            fontSize: icon.size,
            animationDuration: icon.duration,
            animationDelay: icon.delay,
          }}
        >
          {icon.icon}
        </div>
      ))}
    </div>
  );
};
