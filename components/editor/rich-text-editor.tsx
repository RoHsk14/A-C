"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Toolbar } from "./toolbar"
import { cn } from "@/lib/utils"

import Mention from "@tiptap/extension-mention"
import { getSuggestionConfig } from "./suggestion"
import suggestionSpaces from "./suggestion-spaces"

interface RichTextEditorProps {
    content?: string
    onChange?: (content: string) => void
    placeholder?: string
    className?: string
    communityId?: string
}

export function RichTextEditor({
    content = "",
    onChange,
    placeholder = "Écrivez quelque chose...",
    className,
    communityId,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-indigo-600 hover:underline cursor-pointer",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'bg-indigo-100 text-indigo-800 rounded px-1 py-0.5 font-medium',
                },
                suggestion: getSuggestionConfig(communityId),
                renderLabel({ options, node }) {
                    return `@${node.attrs.label ?? node.attrs.id}`
                },
            }),
            Mention.extend({ name: 'hashtag' }).configure({
                HTMLAttributes: {
                    class: 'bg-emerald-100 text-emerald-800 rounded px-1 py-0.5 font-medium',
                },
                suggestion: { ...suggestionSpaces, char: '#' },
                renderLabel({ options, node }) {
                    return `#${node.attrs.label ?? node.attrs.id}`
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[150px] w-full rounded-b-xl border border-t-0 border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm dark:prose-invert max-w-none",
                    className
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
        immediatelyRender: false,
    })

    return (
        <div className="w-full">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
