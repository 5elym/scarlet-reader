import { motion } from 'framer-motion'
import React from 'react'

interface MenuItemData {
  label: string
  icon: React.JSX.Element
  action?: () => void
}

interface MenuItemProps {
  item: MenuItemData
  side: 'left' | 'right'
}

export default function MenuItem({ item, side }: MenuItemProps): React.JSX.Element {
  return (
    <>
      <motion.div
        key={item.label}
        variants={{
          open: { opacity: 1, y: 0, scale: 1 },
          closed: { opacity: 0, y: 8, scale: 0.96 }
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 30, mass: 0.7 }}
        className={`flex items-center gap-4 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <button
          onClick={item.action}
          type="button"
          aria-label={item.label}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-100 shadow-xl transition-colors hover:border-red-500 hover:text-red-400 active:scale-95"
        >
          {item.icon}
        </button>

        <span className="text-base font-semibold tracking-normal text-white drop-shadow-md">
          {item.label}
        </span>
      </motion.div>
    </>
  )
}
