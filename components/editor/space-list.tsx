"use client"

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Hash } from "lucide-react"

export default forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            props.command({ id: item.id, label: item.name }) // TipTap mention uses id/label usually
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
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                            <Hash className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span>{item.name}</span>
                    </button>
                ))
            ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Aucun espace trouvé
                </div>
            )}
        </div>
    )
})
