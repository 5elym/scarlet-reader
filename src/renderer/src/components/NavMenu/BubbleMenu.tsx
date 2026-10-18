import React from 'react'
import { motion } from 'framer-motion'

import { BookText, House, List, Settings } from 'lucide-react'
import MenuBackground from './MenuBackground'
import MenuItem from './MenuItem'
import { useHardwareBack } from '../../utils/returnBack'

interface BubbleMenuProps {
  isOpen: boolean
  side?: 'left' | 'right'
  onClose: () => void
  onHomeClick: () => void
  onContentsClick: () => void
}

export default function BubbleMenu({
  isOpen,
  side = 'right',
  onClose,
  onHomeClick,
  onContentsClick
}: BubbleMenuProps): React.JSX.Element {
  // Placeholder menu items - wire these up to your actual logic later
  const menuItems = [
    { label: 'Library', icon: <House />, action: onHomeClick },
    { label: 'Book Information', icon: <BookText /> },
    { label: 'Contents', icon: <List />, action: onContentsClick },
    { label: 'Settings', icon: <Settings /> }
  ]

  useHardwareBack(isOpen, onClose)

  return (
    <>
      <MenuBackground onClose={onClose} isOpen={isOpen} />

      <motion.div
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.25,
              ease: 'easeOut',
              delayChildren: 0.04,
              staggerChildren: 0.06
            }
          },
          closed: {
            opacity: 0,
            x: side === 'right' ? 24 : -24,
            transition: { duration: 0.2, ease: 'easeIn' }
          }
        }}
        aria-hidden={!isOpen}
        className={`absolute top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4 ${
          side === 'right' ? 'right-6' : 'left-6'
        } ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {menuItems.map((item) => (
          <MenuItem key={item.label} item={item} side={'right'} />
        ))}
      </motion.div>
    </>
  )
}
