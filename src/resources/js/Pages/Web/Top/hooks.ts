import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type AccentToken = 'blush' | 'mint' | 'lavender' | 'sunny' | 'sky'

export type WeddingCategory = {
    id: string
    name: string
    accent: AccentToken
}

export type WeddingTask = {
    id: string
    title: string
    categoryId: string
    emoji: string
    status: TaskStatus
    isDone: boolean
    notes?: string
    due?: string
    assigneeIds: string[]
}

export type TaskStatus = 'not_started' | 'in_progress' | 'done'

export type WeddingMember = {
    id: string
    name: string
    role?: string
    contactEmail?: string
    contactLineId?: string
}

export type AccentStyle = {
    token: AccentToken
    label: string
    gradientFrom: string
    gradientTo: string
    border: string
    badge: string
    checkbox: string
    shadow: string
}

type AddTaskInput = {
    title: string
    categoryId: string
    emoji: string
    notes?: string
    due?: string
    assigneeIds: string[]
}

type AddCategoryInput = {
    name: string
    accent: AccentToken
}

type WeddingBoardSummary = {
    totalTasks: number
    completedTasks: number
    categories: number
    averageProgress: number
}

type AddMemberInput = {
    name: string
    role?: string
    contactEmail?: string
    contactLineId?: string
}

const ACCENT_STYLES: Record<AccentToken, AccentStyle> = {
    blush: {
        token: 'blush',
        label: 'ブーケピンク',
        gradientFrom: 'from-rose-100',
        gradientTo: 'to-pink-50',
        border: 'border-rose-200',
        badge: 'bg-rose-200/70 text-rose-700',
        checkbox: 'accent-rose-400',
        shadow: 'shadow-rose-200/70',
    },
    mint: {
        token: 'mint',
        label: 'ミントグリーン',
        gradientFrom: 'from-emerald-100',
        gradientTo: 'to-teal-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-200/70 text-emerald-700',
        checkbox: 'accent-emerald-400',
        shadow: 'shadow-emerald-200/70',
    },
    lavender: {
        token: 'lavender',
        label: 'ラベンダー',
        gradientFrom: 'from-purple-100',
        gradientTo: 'to-violet-50',
        border: 'border-purple-200',
        badge: 'bg-purple-200/70 text-purple-700',
        checkbox: 'accent-purple-400',
        shadow: 'shadow-purple-200/70',
    },
    sunny: {
        token: 'sunny',
        label: 'シャンパンゴールド',
        gradientFrom: 'from-amber-100',
        gradientTo: 'to-yellow-50',
        border: 'border-amber-200',
        badge: 'bg-amber-200/70 text-amber-700',
        checkbox: 'accent-amber-400',
        shadow: 'shadow-amber-200/70',
    },
    sky: {
        token: 'sky',
        label: 'サムシングブルー',
        gradientFrom: 'from-sky-100',
        gradientTo: 'to-blue-50',
        border: 'border-sky-200',
        badge: 'bg-sky-200/70 text-sky-700',
        checkbox: 'accent-sky-400',
        shadow: 'shadow-sky-200/70',
    },
}

const INITIAL_CATEGORIES: WeddingCategory[] = [
    {
        id: 'cat-pre',
        name: '前撮り',
        accent: 'sky',
    },
    {
        id: 'cat-attire',
        name: 'ドレス・タキシード決定',
        accent: 'lavender',
    },
    {
        id: 'cat-welcome',
        name: 'ウェルカム準備',
        accent: 'blush',
    },
]

const INITIAL_TASKS: WeddingTask[] = [
    {
        id: 'task-pre-shoot-plan',
        title: '前撮りのスケジュール調整',
        categoryId: 'cat-pre',
        emoji: '📸',
        status: 'in_progress',
        isDone: false,
        notes: 'ロケーション撮影の時間帯を確認する',
        due: '2026-02-15',
        assigneeIds: ['member-hana'],
    },
    {
        id: 'task-attire-fit',
        title: 'ドレス・タキシード最終フィッティング',
        categoryId: 'cat-attire',
        emoji: '👗',
        status: 'in_progress',
        isDone: false,
        notes: '小物合わせの持ち物リストを作成',
        due: '2026-03-20',
        assigneeIds: ['member-hana', 'member-daichi'],
    },
    {
        id: 'task-welcome-board',
        title: 'ウェルカムボードのデザイン決定',
        categoryId: 'cat-welcome',
        emoji: '🎀',
        status: 'done',
        isDone: true,
        notes: 'プリント業者に入稿済み',
        due: '2026-01-10',
        assigneeIds: ['member-yui'],
    },
]

const EMOJI_PALETTE = ['💐', '💍', '🎀', '🎂', '💌', '🥂', '🌸', '📸', '👗']

const INITIAL_MEMBERS: WeddingMember[] = [
    {
        id: 'member-hana',
        name: 'はな',
        role: '新婦',
        contactEmail: 'hana@example.com',
        contactLineId: '@hana_wedding',
    },
    {
        id: 'member-daichi',
        name: 'だいち',
        role: '新郎',
        contactEmail: 'daichi@example.com',
    },
    {
        id: 'member-yui',
        name: 'ゆい',
        role: 'ご友人',
        contactEmail: 'yui@example.com',
        contactLineId: '@yui_friend',
    },
]

const createId = (prefix: string): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return `${prefix}-${crypto.randomUUID()}`
    }

    return `${prefix}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

const createCategory = (input: AddCategoryInput): WeddingCategory => ({
    id: createId('cat'),
    name: input.name,
    accent: input.accent,
})

const createTask = (input: AddTaskInput): WeddingTask => ({
    id: createId('task'),
    title: input.title,
    categoryId: input.categoryId,
    emoji: input.emoji,
    status: 'not_started',
    isDone: false,
    notes: input.notes,
    due: input.due,
    assigneeIds: input.assigneeIds,
})

const addCategoryToList = (categories: WeddingCategory[], input: AddCategoryInput): WeddingCategory[] => {
    const exists = categories.some(category => category.name === input.name)
    if (exists) {
        return categories
    }

    return [...categories, createCategory(input)]
}

const addTaskToList = (
    tasks: WeddingTask[],
    categories: WeddingCategory[],
    input: AddTaskInput,
): WeddingTask[] => {
    const categoryExists = categories.some(category => category.id === input.categoryId)
    if (!categoryExists) {
        return tasks
    }

    return [...tasks, createTask(input)]
}

const toggleTaskInList = (tasks: WeddingTask[], taskId: string): WeddingTask[] => (
    tasks.map(task => {
        if (task.id !== taskId) {
            return task
        }

        const isDone = !task.isDone
        const status: TaskStatus = isDone ? 'done' : 'not_started'
        return {
            ...task,
            isDone,
            status,
        }
    })
)

const updateTaskStatusInList = (tasks: WeddingTask[], taskId: string, status: TaskStatus): WeddingTask[] => (
    tasks.map(task => (
        task.id === taskId
            ? { ...task, status, isDone: status === 'done' }
            : task
    ))
)

const clearCompletedTasks = (tasks: WeddingTask[]): WeddingTask[] => (
    tasks.filter(task => !task.isDone)
)

const removeTaskFromList = (tasks: WeddingTask[], taskId: string): WeddingTask[] => (
    tasks.filter(task => task.id !== taskId)
)

const addMemberToList = (members: WeddingMember[], input: AddMemberInput): WeddingMember[] => {
    const name = input.name.trim()
    if (!name) {
        return members
    }

    if (members.some(member => member.name === name)) {
        return members
    }

    return [
        ...members,
        {
            id: createId('member'),
            name,
            role: input.role?.trim() || undefined,
            contactEmail: input.contactEmail?.trim() || undefined,
            contactLineId: input.contactLineId?.trim() || undefined,
        },
    ]
}

const assignMembersToTask = (tasks: WeddingTask[], taskId: string, assigneeIds: string[]): WeddingTask[] => (
    tasks.map(task => (
        task.id === taskId
            ? { ...task, assigneeIds }
            : task
    ))
)

export const useWeddingTaskBoard = () => {
    const [categories, setCategories] = useState<WeddingCategory[]>(INITIAL_CATEGORIES)
    const [tasks, setTasks] = useState<WeddingTask[]>(INITIAL_TASKS)
    const [members, setMembers] = useState<WeddingMember[]>(INITIAL_MEMBERS)
    const alertedTaskIds = useRef<Set<string>>(new Set())
    const ALERT_DAYS_THRESHOLD = 3

    const addCategory = useCallback((input: AddCategoryInput) => {
        const name = input.name.trim()
        if (!name) {
            return
        }

        setCategories(previous => addCategoryToList(previous, {
            name,
            accent: input.accent,
        }))
    }, [])

    const addTask = useCallback((input: AddTaskInput) => {
        const title = input.title.trim()
        const notes = input.notes?.trim() || undefined
        const due = input.due?.trim() || undefined
        const assigneeIds = input.assigneeIds.filter(id => members.some(member => member.id === id))

        if (!title || !input.categoryId) {
            return
        }

        setTasks(previous => addTaskToList(previous, categories, {
            title,
            categoryId: input.categoryId,
            emoji: input.emoji,
            notes,
            due,
            assigneeIds,
        }))
    }, [categories, members])

    const toggleTask = useCallback((taskId: string) => {
        setTasks(previous => toggleTaskInList(previous, taskId))
    }, [])

    const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
        setTasks(previous => updateTaskStatusInList(previous, taskId, status))
    }, [])

    const clearCompleted = useCallback(() => {
        setTasks(previous => clearCompletedTasks(previous))
    }, [])

    const removeTask = useCallback((taskId: string) => {
        setTasks(previous => removeTaskFromList(previous, taskId))
    }, [])

    const assignMembers = useCallback((taskId: string, assigneeIds: string[]) => {
        setTasks(previous => assignMembersToTask(previous, taskId, assigneeIds))
    }, [])

    const addMember = useCallback((input: AddMemberInput) => {
        setMembers(previous => addMemberToList(previous, input))
    }, [])

    const summary = useMemo<WeddingBoardSummary>(() => {
        const totalTasks = tasks.length
        const completedTasks = tasks.filter(task => task.isDone).length
        const categoriesCount = categories.length
        const averageProgress = totalTasks === 0
            ? 0
            : Math.round(tasks.reduce((acc, task) => {
                if (task.status === 'done') return acc + 100
                if (task.status === 'in_progress') return acc + 50
                return acc
            }, 0) / totalTasks)

        return {
            totalTasks,
            completedTasks,
            categories: categoriesCount,
            averageProgress,
        }
    }, [tasks, categories])

    const accentOptions = useMemo(() => Object.values(ACCENT_STYLES), [])

    const categoryOptions = useMemo(() => (
        categories.map(category => ({
            id: category.id,
            name: category.name,
            accent: category.accent,
        }))
    ), [categories])

    const categoryStats = useMemo(() => (
        categories.map(category => ({
            category,
            total: tasks.filter(task => task.categoryId === category.id).length,
        }))
    ), [categories, tasks])

    const membersMap = useMemo(() => (
        new Map(members.map(member => [member.id, member]))
    ), [members])

    const tasksByStatus = useMemo(() => ({
        notStarted: tasks.filter(task => task.status === 'not_started'),
        inProgress: tasks.filter(task => task.status === 'in_progress'),
        done: tasks.filter(task => task.status === 'done'),
    }), [tasks])

    const dueSoonTasks = useMemo(() => {
        const now = new Date()
        return tasks.filter(task => {
            if (!task.due || task.isDone) {
                return false
            }
            const dueDate = new Date(task.due)
            const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            return diffDays >= 0 && diffDays <= ALERT_DAYS_THRESHOLD
        })
    }, [tasks])

    const overdueTasks = useMemo(() => {
        const now = new Date()
        return tasks.filter(task => {
            if (!task.due || task.isDone) {
                return false
            }
            const dueDate = new Date(task.due)
            return dueDate.getTime() < now.getTime()
        })
    }, [tasks])

    const calendarEvents = useMemo(() => (
        tasks
            .filter(task => task.due)
            .map(task => ({
                id: task.id,
                title: task.title,
                due: task.due as string,
                status: task.status,
                assignees: task.assigneeIds.map(id => membersMap.get(id)?.name ?? 'メンバー未設定'),
            }))
    ), [tasks, membersMap])

    const triggerAlerts = useCallback((tasksToAlert: WeddingTask[]) => {
        tasksToAlert.forEach(task => {
            if (alertedTaskIds.current.has(task.id)) {
                return
            }

            alertedTaskIds.current.add(task.id)
            const assignees = task.assigneeIds.map(id => membersMap.get(id)).filter(Boolean)

            if (typeof fetch === 'function') {
                void fetch('/api/alerts/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        taskId: task.id,
                        title: task.title,
                        due: task.due,
                        status: task.status,
                        assignees: assignees.map(member => ({
                            name: member?.name,
                            contactEmail: member?.contactEmail,
                            contactLineId: member?.contactLineId,
                        })),
                    }),
                })
                    .then(response => {
                        if (!response.ok) {
                            console.info('[Alert Preview]', task.title, task.due)
                        }
                    })
                    .catch(() => {
                        console.info('[Alert Preview]', task.title, task.due)
                    })
            } else {
                console.info('[Alert Preview]', task.title, task.due)
            }
        })
    }, [membersMap])

    useEffect(() => {
        const pendingAlerts = [...dueSoonTasks, ...overdueTasks]
        if (pendingAlerts.length > 0) {
            triggerAlerts(pendingAlerts)
        }
    }, [dueSoonTasks, overdueTasks, triggerAlerts])

    return {
        tasks,
        categories,
        members,
        summary,
        accentOptions,
        emojiPalette: EMOJI_PALETTE,
        categoryOptions,
        categoryStats,
        tasksByStatus,
        dueSoonTasks,
        overdueTasks,
        calendarEvents,
        membersMap,
        addCategory,
        addTask,
        toggleTask,
        updateTaskStatus,
        clearCompleted,
        removeTask,
        addMember,
        assignMembers,
    }
}

export {
    ACCENT_STYLES,
    EMOJI_PALETTE,
    addCategoryToList,
    addTaskToList,
    toggleTaskInList,
    updateTaskStatusInList,
    clearCompletedTasks,
    removeTaskFromList,
    addMemberToList,
    assignMembersToTask,
}
