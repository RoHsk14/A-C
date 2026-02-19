
'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarContent } from '@/components/sidebar-content'
import { SmartRightSidebar } from '@/components/dashboard/smart-right-sidebar'


interface Space {
    id: string
    slug: string
    name: string
    is_private: boolean
}

interface Community {
    id: string
    name: string
    slug: string
    spaces: Space[]
}

interface MobileHeaderProps {
    communities?: Community[]
    userRole: string | undefined | null
    customLogo?: string | null
    customTitle?: string
    userIdentity: React.ReactNode
}


import { useState, useRef, TouchEvent } from 'react'
import { useParams } from 'next/navigation'

export function MobileHeader({ communities, userRole, customLogo, customTitle, userIdentity }: MobileHeaderProps) {
    const [leftOpen, setLeftOpen] = useState(false)
    const [rightOpen, setRightOpen] = useState(false)
    const params = useParams()
    const communitySlug = params?.slug as string

    const activeCommunity = communities?.find(c => c.slug === communitySlug)

    // Swipe Logic
    const touchStart = useRef<number | null>(null)
    const touchEnd = useRef<number | null>(null)

    // Minimum swipe distance
    const minSwipeDistance = 50

    const onTouchStart = (e: TouchEvent) => {
        touchEnd.current = null
        touchStart.current = e.targetTouches[0].clientX
    }

    const onTouchMove = (e: TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX
    }

    const onTouchEndLeft = () => {
        if (!touchStart.current || !touchEnd.current) return
        const distance = touchStart.current - touchEnd.current
        const isLeftSwipe = distance > minSwipeDistance
        if (isLeftSwipe) {
            setLeftOpen(false)
        }
    }

    const onTouchEndRight = () => {
        if (!touchStart.current || !touchEnd.current) return
        const distance = touchStart.current - touchEnd.current
        const isRightSwipe = distance < -minSwipeDistance
        if (isRightSwipe) {
            setRightOpen(false)
        }
    }

    return (
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
            {/* Left Drawer (Navigation) */}
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-0 w-72 outline-none">
                    <div
                        className="h-full w-full outline-none"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEndLeft}
                    >
                        <span className="sr-only">
                            <SheetTitle>Navigation Menu</SheetTitle>
                        </span>
                        <SidebarContent
                            communities={communities}
                            userRole={userRole}
                            customLogo={customLogo}
                            customTitle={customTitle}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Title */}
            <div className="font-semibold text-lg truncate max-w-[200px]">
                {activeCommunity ? activeCommunity.name : (customTitle || 'AfroCircle')}
            </div>

            {/* Right Drawer (Members/Sidebar) */}
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2">
                        <Users className="h-6 w-6" />
                        <span className="sr-only">Membres</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 border-l-0 w-80 sm:w-80 outline-none">
                    <div
                        className="h-full w-full outline-none"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEndRight}
                    >
                        <span className="sr-only">
                            <SheetTitle>Engagement Sidebar</SheetTitle>
                        </span>
                        <SmartRightSidebar
                            userIdentity={userIdentity}
                            className="block w-full h-full border-none static shadow-none"
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    )
}
