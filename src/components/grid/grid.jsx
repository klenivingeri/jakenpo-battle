import React from 'react';
import styles from './GridContainer.css';

const GridContainer = ({ children }) => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.gridContainer}>
        {/* Exemplo de itens internos */}
        {children || Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.gridItem}>
            Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridContainer;