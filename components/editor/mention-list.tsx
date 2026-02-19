"use client"

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            props.command({ id: item.id, label: item.name }) // Fix: pass id and label correctly
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="bg-popover text-popover-foreground border rounded-md shadow-md overflow-hidden p-1 min-w-[200px]">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-sm ${index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                            }`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={item.avatar_url} />
                            <AvatarFallback>{item.name?.charAt(0) || '@'}</AvatarFallback>
                        </Avatar>
                        <span>{item.name}</span>
                    </button>
                ))
            ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Aucun résultat
                </div>
            )}
        </div>
    )
})
