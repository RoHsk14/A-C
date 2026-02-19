import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import MentionList from './mention-list'
import { createClient } from '@/lib/supabase/client'

const getMentionSuggestions = async (query: string, communityId?: string) => {
    const supabase = createClient()

    let queryBuilder = supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `${query}%`)
        .limit(5)

    if (communityId) {
        // Filter users who are members of the given community
        const { data: communityMembers } = await supabase
            .from('community_members')
            .select('user_id')
            .eq('community_id', communityId)

        const memberIds = communityMembers?.map(m => m.user_id) || []

        if (memberIds.length > 0) {
            queryBuilder = queryBuilder.in('id', memberIds)
        } else {
            return [] // No members in this community matching query
        }
    }

    const { data: users, error } = await queryBuilder

    if (error) {
        console.error('Error fetching users for mention:', error)
        return []
    }

    return users || []
}

export const getSuggestionConfig = (communityId?: string) => ({
    items: async ({ query }: { query: string }) => {
        return getMentionSuggestions(query, communityId)
    },

    render: () => {
        let component: ReactRenderer | null
        let popup: any

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
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
})
