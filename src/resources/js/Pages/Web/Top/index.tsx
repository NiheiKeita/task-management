import React, { useEffect, useMemo, useState } from 'react'
import { TaskCard } from './components/TaskCard'
import { CalendarModal } from './components/CalendarModal'
import { useWeddingTaskBoard, ACCENT_STYLES } from './hooks'
import type { AccentToken } from './hooks'

type TaskFormState = {
    title: string
    categoryId: string
    emoji: string
    notes: string
    due: string
    assigneeIds: string[]
}

type CategoryFormState = {
    name: string
    accent: AccentToken
    emoji: string
}

type MemberFormState = {
    name: string
    role: string
    contactEmail: string
    contactLineId: string
}

type OverlayModalProps = {
    isOpen: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
}

const OverlayModal = ({ isOpen, title, onClose, children }: OverlayModalProps) => {
    if (!isOpen) {
        return null
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-sm'>
            <div className='relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl'>
                <div className='flex items-start justify-between gap-3'>
                    <h2 className='text-lg font-bold text-rose-500'>{title}</h2>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-500 hover:bg-rose-100'
                    >
                        閉じる
                    </button>
                </div>
                <div className='mt-4 space-y-4 text-sm text-gray-600'>
                    {children}
                </div>
            </div>
        </div>
    )
}

export const Top = React.memo(function Top() {
    const {
        tasks,
        categories,
        members,
        summary,
        accentOptions,
        emojiPalette,
        categoryOptions,
        categoryStats,
        dueSoonTasks,
        overdueTasks,
        calendarEvents,
        membersMap,
        loading,
        error,
        addCategory,
        addTask,
        updateTaskStatus,
        removeTask,
        addMember,
        updateMember,
        removeMember,
        assignMembers,
    } = useWeddingTaskBoard()

    const [newTask, setNewTask] = useState<TaskFormState>(() => ({
        title: '',
        categoryId: '',
        emoji: '💐', // デフォルト値（カテゴリ選択時に上書きされる）
        notes: '',
        due: '',
        assigneeIds: [],
    }))
    const [newCategory, setNewCategory] = useState<CategoryFormState>(() => ({
        name: '',
        accent: accentOptions[0]?.token ?? 'blush',
        emoji: emojiPalette[0] ?? '🌸',
    }))
    const [newMember, setNewMember] = useState<MemberFormState>({
        name: '',
        role: '',
        contactEmail: '',
        contactLineId: '',
    })
    const [taskError, setTaskError] = useState<string | null>(null)
    const [categoryError, setCategoryError] = useState<string | null>(null)
    const [memberError, setMemberError] = useState<string | null>(null)
    const [isCalendarOpen, setCalendarOpen] = useState(false)
    const [isDatePickerOpen, setDatePickerOpen] = useState(false)
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)
    const [isMemberModalOpen, setMemberModalOpen] = useState(false)
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<{ id: string; name: string; role: string; contactEmail: string; contactLineId: string } | null>(null)

    useEffect(() => {
        setNewTask(previous => {
            if (categoryOptions.length === 0) {
                return { ...previous, categoryId: '', emoji: '🌸' }
            }

            const exists = categoryOptions.some(option => option.id === previous.categoryId)
            if (exists) {
                return previous
            }

            const firstCategory = categoryOptions[0]
            const selectedCategory = categories.find(cat => cat.id === firstCategory?.id)

            return {
                ...previous,
                categoryId: firstCategory?.id ?? '',
                emoji: selectedCategory?.emoji ?? '🌸',
            }
        })
    }, [categoryOptions, categories])

    const assigneeOptions = useMemo(() => (
        members.map(member => ({ id: member.id, label: member.name, role: member.role }))
    ), [members])


    const dueSoonSet = useMemo(() => new Set(dueSoonTasks.map(task => task.id)), [dueSoonTasks])
    const overdueSet = useMemo(() => new Set(overdueTasks.map(task => task.id)), [overdueTasks])

    const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!newTask.title.trim() || !newTask.categoryId) {
            setTaskError('タスク名とカテゴリを入力してください')
            return
        }

        const taskData = {
            title: newTask.title.trim(),
            categoryId: newTask.categoryId,
            emoji: newTask.emoji,
            notes: newTask.notes.trim() ? newTask.notes.trim() : undefined,
            due: newTask.due.trim() ? newTask.due : undefined,
            assigneeIds: newTask.assigneeIds,
        }

        // タスクを追加
        await addTask(taskData)

        setTaskError(null)
        setNewTask(state => ({
            title: '',
            categoryId: state.categoryId,
            emoji: emojiPalette[0] ?? '💐',
            notes: '',
            due: '',
            assigneeIds: state.assigneeIds,
        }))
    }

    const handleCategorySubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const name = newCategory.name.trim()

        if (!name) {
            setCategoryError('カテゴリ名を入力してください')
            return
        }

        if (categories.some(category => category.name === name)) {
            setCategoryError('同じカテゴリ名が存在します')
            return
        }

        addCategory({
            name,
            accent: newCategory.accent,
            emoji: newCategory.emoji,
        })

        setCategoryError(null)
        setNewCategory({ name: '', accent: newCategory.accent, emoji: newCategory.emoji })
        setCategoryModalOpen(false)
    }

    const handleMemberSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!newMember.name.trim()) {
            setMemberError('メンバー名を入力してください')
            return
        }

        if (members.some(member => member.name === newMember.name.trim())) {
            setMemberError('同じメンバー名が存在します')
            return
        }

        addMember({
            name: newMember.name,
            role: newMember.role,
            contactEmail: newMember.contactEmail,
            contactLineId: newMember.contactLineId,
        })

        setMemberError(null)
        setNewMember({
            name: '',
            role: '',
            contactEmail: '',
            contactLineId: '',
        })
        setMemberModalOpen(false)
    }

    const handleDateSelect = (date: string) => {
        setNewTask(state => ({ ...state, due: date }))
    }


    // デバッグ: tasksとcalendarEventsの詳細確認
    console.log('=== DEBUG INFO ===')
    console.log('Loading:', loading)
    console.log('Tasks count:', tasks.length)
    console.log('Tasks with due date:', tasks.filter(task => task.due))
    console.log('Calendar events count:', calendarEvents.length)
    console.log('=== END DEBUG ===')

    // Loading state
    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-rose-500 font-semibold'>データを読み込み中...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 flex items-center justify-center px-4'>
                <div className='text-center max-w-md'>
                    <div className='text-6xl mb-4'>⚠️</div>
                    <h2 className='text-xl font-bold text-rose-600 mb-2'>エラーが発生しました</h2>
                    <p className='text-gray-600 mb-4'>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition'
                    >
                        ページを再読み込み
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
        <div className='min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 pb-4 pt-4 md:pb-10 md:pt-8'>
            <div className='mx-auto flex max-w-[92rem] flex-col gap-3 px-3 md:gap-6 md:px-6 xl:px-10'>
                <header className='relative rounded-3xl bg-white/80 p-4 md:p-6 shadow-xl backdrop-blur'>
                    <div className='absolute right-4 top-4 md:right-6 md:top-6'>
                        {/* スマホでは三本線メニュー */}
                        <div className='md:hidden'>
                            <button
                                type='button'
                                onClick={() => setMobileMenuOpen(true)}
                                className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 shadow-md transition hover:bg-white'
                            >
                                <svg className='h-5 w-5 text-rose-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-col items-center gap-3 text-center'>
                        <h1 className='text-2xl md:text-3xl lg:text-4xl font-extrabold text-rose-500'>
                            💐 タスクブーケ 💐
                        </h1>
                        <div className='flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs lg:text-sm font-semibold text-gray-500'>
                            <span>挙式日：2026年5月2日（土）</span>
                            <span>式場：アニヴェルセルみなとみらい</span>
                        </div>
                    </div>
                </header>
                <div className='flex flex-col gap-4 md:flex-row md:items-start'>
                    <section className='flex-1 rounded-3xl bg-white/75 p-2 md:p-3 shadow-xl backdrop-blur'>
                        <div className='flex flex-wrap items-center justify-between gap-1 md:gap-2'>
                            <h2 className='text-sm font-bold text-rose-500'>🌸 新しいタスクを追加</h2>
                            <button
                                type='button'
                                onClick={() => setCalendarOpen(true)}
                                className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-600 shadow hover:bg-amber-100'
                            >
                                📅 カレンダーを見る
                            </button>
                        </div>
                        <form onSubmit={handleTaskSubmit} className='mt-2 grid gap-1.5 md:grid-cols-[2fr,1fr,1fr,0.8fr,auto] md:items-end'>
                            <label className='flex flex-col text-[10px] font-semibold text-gray-500'>
                                <span>タスク名</span>
                                <input
                                    type='text'
                                    value={newTask.title}
                                    onChange={event => setNewTask(state => ({ ...state, title: event.target.value }))}
                                    placeholder='前撮りのスケジュール調整'
                                    className='mt-0.5 w-full rounded-md border border-pink-100 bg-white/90 px-1.5 py-0.5 text-[11px] shadow-inner focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200'
                                />
                            </label>
                            <label className='flex flex-col text-[10px] font-semibold text-gray-500'>
                                <span>カテゴリ</span>
                                <select
                                    value={newTask.categoryId}
                                    onChange={event => {
                                        const selectedCategory = categories.find(cat => cat.id === event.target.value)
                                        setNewTask(state => ({
                                            ...state,
                                            categoryId: event.target.value,
                                            emoji: selectedCategory?.emoji ?? state.emoji
                                        }))
                                    }}
                                    disabled={categoryOptions.length === 0}
                                    className='mt-0.5 w-full rounded-md border border-pink-100 bg-white/90 px-1.5 py-0.5 text-[11px] shadow-inner focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {categoryOptions.length === 0 ? (
                                        <option value=''>カテゴリを追加してください</option>
                                    ) : null}
                                    {categoryOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className='flex flex-col text-[10px] font-semibold text-gray-500'>
                                <span>担当メンバー</span>
                                <select
                                    value={newTask.assigneeIds[0] || ''}
                                    onChange={event => {
                                        const selectedId = event.target.value
                                        setNewTask(state => ({
                                            ...state,
                                            assigneeIds: selectedId ? [selectedId] : []
                                        }))
                                    }}
                                    className='mt-0.5 w-full rounded-md border border-pink-100 bg-white/90 px-1.5 py-0.5 text-[11px] shadow-inner focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200'
                                >
                                    <option value=''>担当者を選択</option>
                                    {assigneeOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}{option.role ? ` (${option.role})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className='flex flex-col text-[10px] font-semibold text-gray-500'>
                                <span>期限</span>
                                <div className='flex gap-1'>
                                    <input
                                        type='date'
                                        value={newTask.due}
                                        onChange={event => setNewTask(state => ({ ...state, due: event.target.value }))}
                                        className='mt-0.5 flex-1 rounded-md border border-pink-100 bg-white/90 px-1.5 py-0.5 text-[11px] shadow-inner focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setDatePickerOpen(true)}
                                        className='mt-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-600 hover:bg-amber-200 md:hidden'
                                        title='カレンダーから選択'
                                    >
                                        📅
                                    </button>
                                </div>
                            </label>
                            <button
                                type='submit'
                                className='h-6 rounded-md bg-rose-400 px-2 text-[10px] font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-200'
                            >
                                追加 ✨
                            </button>
                            <label className='flex flex-col text-[10px] font-semibold text-gray-500 md:col-span-6'>
                                <span>ノート</span>
                                <textarea
                                    value={newTask.notes}
                                    onChange={event => setNewTask(state => ({ ...state, notes: event.target.value }))}
                                    placeholder='メモを短く残せます'
                                    rows={1}
                                    className='mt-0.5 w-full resize-none rounded-md border border-pink-100 bg-white/90 px-1.5 py-0.5 text-[11px] shadow-inner focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200'
                                />
                            </label>
                        </form>
                        {taskError ? (
                            <p className='mt-1.5 text-[10px] font-semibold text-rose-500'>{taskError}</p>
                        ) : null}
                    </section>

                    <section className='hidden md:block w-full rounded-3xl bg-white/75 p-3 shadow-xl backdrop-blur md:max-w-xs'>
                        <div className='space-y-3'>
                            <button
                                type='button'
                                onClick={() => setCategoryModalOpen(true)}
                                className='flex w-full items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            >
                                🎨 カテゴリを追加
                            </button>

                            <button
                                type='button'
                                onClick={() => setMemberModalOpen(true)}
                                className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                            >
                                🤝 メンバー管理
                            </button>
                        </div>
                    </section>
                </div>

                <section className='space-y-2 md:space-y-4'>
                    <div className='flex items-center gap-3'>
                        <h2 className='text-sm font-bold text-rose-500'>🌼 マイタスクリスト</h2>
                        {categoryStats.length > 0 ? (
                            <div className='flex gap-1.5'>
                                {categoryStats.map(stat => {
                                    const accentStyle = ACCENT_STYLES[stat.category.accent]
                                    return (
                                        <div
                                            key={stat.category.id}
                                            className={`rounded-lg border ${accentStyle.border} bg-white/70 px-2 py-1 text-[9px] font-semibold text-gray-600 shadow-sm`}
                                        >
                                            <span className='text-rose-500'>{stat.category.name}</span>
                                            <span className='ml-1 text-[8px] text-gray-500'>{stat.total}件</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : null}
                    </div>

                    {tasks.length === 0 ? (
                        <p className='rounded-3xl border border-dashed border-rose-200 bg-white/80 p-8 text-center text-sm text-gray-500'>
                            まだタスクはありません。上のフォームから追加してみましょう 🌷
                        </p>
                    ) : (
                        <div className='space-y-3'>
                            {tasks.map(task => {
                                const category = categories.find(item => item.id === task.categoryId)
                                const accent = category ? ACCENT_STYLES[category.accent] : accentOptions[0]

                                if (!accent) {
                                    return null
                                }

                                const assigneeList = task.assigneeIds
                                    .map(id => membersMap.get(id))
                                    .filter((member): member is NonNullable<typeof member> => Boolean(member))

                                const highlight = overdueSet.has(task.id)
                                    ? 'overdue'
                                    : dueSoonSet.has(task.id)
                                        ? 'dueSoon'
                                        : null

                                return (
                                    <TaskCard
                                        key={task.id}
                                        accentStyle={accent}
                                        emoji={task.emoji}
                                        title={task.title}
                                        categoryLabel={category?.name ?? '未設定'}
                                        notes={task.notes}
                                        due={task.due}
                                        status={task.status}
                                        assignees={assigneeList.map(member => ({
                                            id: member.id,
                        name: member.name,
                        role: member.role,
                    }))}
                                        allMembers={members.map(member => ({
                                            id: member.id,
                        name: member.name,
                        role: member.role,
                    }))}
                                        highlight={highlight}
                                        onStatusChange={value => updateTaskStatus(task.id, value)}
                                        onAssigneesChange={ids => assignMembers(task.id, ids)}
                                        onRemove={() => removeTask(task.id)}
                                    />
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
        <CalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setCalendarOpen(false)}
            events={calendarEvents}
        />
        <CalendarModal
            isOpen={isDatePickerOpen}
            onClose={() => setDatePickerOpen(false)}
            events={calendarEvents}
            onDateSelect={handleDateSelect}
            showDateSelection={true}
        />
        <OverlayModal
            isOpen={isCategoryModalOpen}
            onClose={() => {
                setCategoryModalOpen(false)
                setCategoryError(null)
            }}
            title='カテゴリを登録'
        >
            <form onSubmit={handleCategorySubmit} className='space-y-3 text-[13px]'>
                <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                    <span>カテゴリ名</span>
                    <input
                        type='text'
                        value={newCategory.name}
                        onChange={event => setNewCategory(state => ({ ...state, name: event.target.value }))}
                        placeholder='例: 料理打ち合わせ'
                        className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                    />
                </label>
                <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                    <span>アイコン</span>
                    <select
                        value={newCategory.emoji}
                        onChange={event => setNewCategory(state => ({ ...state, emoji: event.target.value }))}
                        className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                    >
                        {emojiPalette.map(emoji => (
                            <option key={emoji} value={emoji}>
                                {emoji}
                            </option>
                        ))}
                    </select>
                </label>
                <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                    <span>テーマカラー</span>
                    <select
                        value={newCategory.accent}
                        onChange={event => setNewCategory(state => ({ ...state, accent: event.target.value as AccentToken }))}
                        className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                    >
                        {accentOptions.map(option => (
                            <option key={option.token} value={option.token}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type='submit'
                    className='w-full rounded-lg bg-rose-400 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                >
                    カテゴリを追加
                </button>
                {categoryError ? (
                    <p className='text-xs font-semibold text-rose-500'>{categoryError}</p>
                ) : null}
            </form>
        </OverlayModal>
        <OverlayModal
            isOpen={isMemberModalOpen}
            onClose={() => {
                setMemberModalOpen(false)
                setMemberError(null)
            }}
            title='メンバー管理'
        >
            <div className='space-y-4'>
                <div>
                    <h3 className='text-sm font-semibold text-gray-700 mb-3'>現在のメンバー</h3>
                    <ul className='space-y-2 text-[12px] text-gray-600 max-h-32 overflow-y-auto'>
                        {members.length === 0 ? (
                            <li className='rounded-lg bg-gray-50 px-3 py-2 text-gray-400'>メンバーがまだいません</li>
                        ) : members.map(member => (
                            <li key={member.id} className='rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-semibold text-gray-700'>{member.name}</span>
                                            {member.role ? <span className='text-[10px] text-blue-500'>{member.role}</span> : null}
                                        </div>
                                        <div className='mt-1 space-y-1 text-[10px] text-gray-500'>
                                            {member.contactEmail ? <p>📧 {member.contactEmail}</p> : null}
                                            {member.contactLineId ? <p>💬 LINE: {member.contactLineId}</p> : null}
                                        </div>
                                    </div>
                                    <div className='flex gap-1'>
                                        <button
                                            type='button'
                                            onClick={() => setEditingMember({
                                                id: member.id,
                                                name: member.name,
                                                role: member.role || '',
                                                contactEmail: member.contactEmail || '',
                                                contactLineId: member.contactLineId || ''
                                            })}
                                            className='text-[9px] text-blue-500 hover:text-blue-600 underline'
                                        >
                                            編集
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                if (confirm(`${member.name}を削除しますか？`)) {
                                                    removeMember(member.id)
                                                }
                                            }}
                                            className='text-[9px] text-rose-500 hover:text-rose-600 underline'
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='border-t pt-4'>
                    <h3 className='text-sm font-semibold text-gray-700 mb-3'>新しいメンバーを追加</h3>
                    <form onSubmit={handleMemberSubmit} className='grid gap-3 text-[13px]'>
                        <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                            <span>メンバー名</span>
                            <input
                                type='text'
                                value={newMember.name}
                                onChange={event => setNewMember(state => ({ ...state, name: event.target.value }))}
                                placeholder='例: さやか'
                                className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            />
                        </label>
                        <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                            <span>役割</span>
                            <input
                                type='text'
                                value={newMember.role}
                                onChange={event => setNewMember(state => ({ ...state, role: event.target.value }))}
                                placeholder='例: プランナー'
                                className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            />
                        </label>
                        <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                            <span>メール</span>
                            <input
                                type='email'
                                value={newMember.contactEmail}
                                onChange={event => setNewMember(state => ({ ...state, contactEmail: event.target.value }))}
                                placeholder='例: planner@example.com'
                                className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            />
                        </label>
                        <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                            <span>LINE ID</span>
                            <input
                                type='text'
                                value={newMember.contactLineId}
                                onChange={event => setNewMember(state => ({ ...state, contactLineId: event.target.value }))}
                                placeholder='例: @planner123'
                                className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            />
                        </label>
                        <button
                            type='submit'
                            className='w-full rounded-lg bg-blue-400 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                        >
                            メンバーを追加
                        </button>
                        {memberError ? (
                            <p className='text-xs font-semibold text-rose-500'>{memberError}</p>
                        ) : null}
                    </form>
                </div>

                {/* メンバー編集フォーム */}
                {editingMember && (
                    <div className='border-t pt-4 mt-4'>
                        <h3 className='text-sm font-semibold text-gray-700 mb-3'>メンバーを編集</h3>
                        <form onSubmit={(event) => {
                            event.preventDefault()
                            updateMember({
                                id: editingMember.id,
                                name: editingMember.name,
                                role: editingMember.role,
                                contactEmail: editingMember.contactEmail,
                                contactLineId: editingMember.contactLineId,
                            })
                            setEditingMember(null)
                        }} className='grid gap-3 text-[13px]'>
                            <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                                <span>メンバー名</span>
                                <input
                                    type='text'
                                    value={editingMember.name}
                                    onChange={event => setEditingMember(prev => prev ? {...prev, name: event.target.value} : null)}
                                    className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                            <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                                <span>役割</span>
                                <input
                                    type='text'
                                    value={editingMember.role}
                                    onChange={event => setEditingMember(prev => prev ? {...prev, role: event.target.value} : null)}
                                    className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                            <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                                <span>メール</span>
                                <input
                                    type='email'
                                    value={editingMember.contactEmail}
                                    onChange={event => setEditingMember(prev => prev ? {...prev, contactEmail: event.target.value} : null)}
                                    className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                            <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                                <span>LINE ID</span>
                                <input
                                    type='text'
                                    value={editingMember.contactLineId}
                                    onChange={event => setEditingMember(prev => prev ? {...prev, contactLineId: event.target.value} : null)}
                                    className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                            <div className='flex gap-2'>
                                <button
                                    type='submit'
                                    className='flex-1 rounded-lg bg-green-400 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-200'
                                >
                                    更新
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setEditingMember(null)}
                                    className='flex-1 rounded-lg bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200'
                                >
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </OverlayModal>

        {/* スマホ用メニューモーダル */}
        <OverlayModal
            isOpen={isMobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            title='メニュー'
        >
            <div className='space-y-3'>
                <button
                    type='button'
                    onClick={() => {
                        setCategoryModalOpen(true)
                        setMobileMenuOpen(false)
                    }}
                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                >
                    🎨 カテゴリを追加
                </button>

                <button
                    type='button'
                    onClick={() => {
                        setMemberModalOpen(true)
                        setMobileMenuOpen(false)
                    }}
                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                >
                    🤝 メンバー管理
                </button>

                <button
                    type='button'
                    onClick={() => {
                        setCalendarOpen(true)
                        setMobileMenuOpen(false)
                    }}
                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200'
                >
                    📅 カレンダーを見る
                </button>
            </div>
        </OverlayModal>
        </>
    )
})

export default Top
