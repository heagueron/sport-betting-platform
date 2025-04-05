import { Link } from 'react-router-dom';
import styles from './ImageCollage.module.css';

interface CollageItem {
  image: string;
  title: string;
  description: string;
  link: string;
}

interface ImageCollageProps {
  items: CollageItem[];
}

export const ImageCollage = ({ items }: ImageCollageProps) => {
  // Ensure we have at least 4 items
  const displayItems = items.slice(0, 4);

  // If we have less than 4 items, duplicate the last one
  while (displayItems.length < 4) {
    displayItems.push(displayItems[displayItems.length - 1]);
  }

  return (
    <div className={styles.collage}>
      {displayItems.map((item, index) => (
        <Link key={index} to={item.link} className={styles.collageItem}>
          <img src={item.image} alt={item.title} className={styles.collageImage} />
          <div className={styles.collageOverlay}>
            <h3 className={styles.collageTitle}>{item.title}</h3>
            <p className={styles.collageDescription}>{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};
