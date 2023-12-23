'use client'

import { Button } from '+ui/ui/button'
import Link from 'next/link'

export default function PageNotFound() {
  return (
    <div className="container px-4 mx-auto pt-16 md:mt-20 lg:mt-28 xl:mt-36">
      <div className="flex flex-wrap items-center -mx-4">
        <div className="w-full md:w-1/2 px-4 mb-16 md:mb-0">
          <img className="mx-auto rounded" src="/dog-error.png" alt="dog error" />
        </div>
        <div className="w-full md:w-1/2 px-4">
          <div className="md:max-w-xl text-center md:text-left">
            <span className="inline-block py-px px-3 mb-4 text-xs leading-5 text-destructive-foreground bg-destructive font-medium rounded-full shadow-sm">
              Error 404
            </span>
            <h2 className="mb-4 text-4xl md:text-5xl leading-tight font-bold tracking-tighter">
              Oh no! Page not found.
            </h2>
            <p className="mb-10 text-lg md:text-xl text-muted-foreground">
              Please make sure you have typed the correct address.
            </p>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-auto py-1 lg:py-0 lg:mr-6">
                <Button size={'lg'} asChild>
                  <Link href="/">Go back to Homepage</Link>
                </Button>
              </div>
              <div className="w-full lg:w-auto py-1 lg:py-0">
                <Button
                  variant={'outline'}
                  size={'lg'}
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}