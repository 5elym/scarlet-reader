import { motion } from 'framer-motion'
import React from 'react'

interface MenuBackgroundProps {
  onClose: () => void
  isOpen: boolean
}

export default function MenuBackground({
  onClose,
  isOpen
}: MenuBackgroundProps): React.JSX.Element {
  return (
    <>
      <motion.div
        onClick={onClose}
        aria-hidden="true"
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`absolute inset-0 z-40 bg-black/60 backdrop-blur-md ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      />
    </>
  )
}
