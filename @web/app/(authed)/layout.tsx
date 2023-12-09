'use client'

import { Button } from '@dinstack/ui/button'
import { cn } from '@dinstack/ui/lib/utils'
import { CaretLeftIcon, CaretRightIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { Navbar } from './_components/navbar'
import { RequireAuthedWrapper } from './_wrappers/require-authed'

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarSize, setSidebarSize] = useState<'default' | 'icon'>('default')

  return (
    <RequireAuthedWrapper>
      <div className="h-full flex">
        <div className="h-full p-4 pb-6 relative z-10">
          <motion.div
            className="h-full"
            initial={{ width: sidebarSize === 'default' ? 288 : 36 }}
            animate={{ width: sidebarSize === 'default' ? 288 : 36 }}
          >
            <Navbar />
          </motion.div>

          <div className="absolute top-2 -right-3">
            {match(sidebarSize)
              .with('default', () => (
                <Button
                  type="button"
                  variant={'outline'}
                  size={'icon'}
                  className="h-6 w-6 bg-background"
                  onClick={() => setSidebarSize('icon')}
                >
                  <CaretLeftIcon className="h-4 w-4" />
                </Button>
              ))
              .with('icon', () => (
                <Button
                  type="button"
                  variant={'outline'}
                  size={'icon'}
                  className="h-6 w-6 bg-background"
                  onClick={() => setSidebarSize('default')}
                >
                  <CaretRightIcon className="h-4 w-4" />
                </Button>
              ))
              .exhaustive()}
          </div>
        </div>
        <div className="flex-1 h-full">{children}</div>
      </div>
    </RequireAuthedWrapper>
  )
}
