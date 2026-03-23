import React from 'react'
import styles from './Toast.module.css'

export default function Toast({ show, message, type = 'success' }) {
  return (
    <div className={`${styles.toast} ${show ? styles.show : ''} ${styles[type]}`}>
      <span className={styles.icon}>
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      {message}
    </div>
  )
}
