import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import SpaceList from './space-list'
import { getMySpaces } from '@/app/actions'

const getSpaceSuggestions = async (query: string) => {
    try {
        const spaces = await getMySpaces()

        if (!query) return spaces.slice(0, 5)

        return spaces.filter((space: any) =>
            space.name.toLowerCase().startsWith(query.toLowerCase())
        ).slice(0, 5)
    } catch (error) {
        console.error('Error fetching spaces for mention:', error)
        return []
    }
}

export default {
    items: async ({ query }: { query: string }) => {
        return getSpaceSuggestions(query)
    },

    render: () => {
        let component: ReactRenderer | null
        let popup: any

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(SpaceList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props: any) {
                component?.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return (component?.ref as any)?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component?.destroy()
            },
        }
    },
}
