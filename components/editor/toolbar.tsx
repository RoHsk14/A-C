"use client"

import { type Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Undo,
    Redo,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"

interface ToolbarProps {
    editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
    if (!editor) {
        return null
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href
        const url = window.prompt("URL", previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }

    return (
        <div className="border border-input bg-transparent rounded-t-xl p-2 flex flex-wrap gap-1 items-center">
            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("code")}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                aria-label="Code"
            >
                <Code className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-border mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Bullet List"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("blockquote")}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </Toggle>
            <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={editor.isActive("link") ? "bg-accent" : ""}
                aria-label="Link"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>

            <div className="ml-auto flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    aria-label="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    aria-label="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
