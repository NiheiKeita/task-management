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
        tasksByStatus,
        dueSoonTasks,
        overdueTasks,
        calendarEvents,
        membersMap,
        addCategory,
        addTask,
        updateTaskStatus,
        removeTask,
        addMember,
        assignMembers,
    } = useWeddingTaskBoard()

    const [newTask, setNewTask] = useState<TaskFormState>(() => ({
        title: '',
        categoryId: '',
        emoji: emojiPalette[0] ?? '💐',
        notes: '',
        due: '',
        assigneeIds: [],
    }))
    const [newCategory, setNewCategory] = useState<CategoryFormState>(() => ({
        name: '',
        accent: accentOptions[0]?.token ?? 'blush',
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
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)
    const [isMemberModalOpen, setMemberModalOpen] = useState(false)

    useEffect(() => {
        setNewTask(previous => {
            if (categoryOptions.length === 0) {
                return { ...previous, categoryId: '' }
            }

            const exists = categoryOptions.some(option => option.id === previous.categoryId)
            if (exists) {
                return previous
            }

            return {
                ...previous,
                categoryId: categoryOptions[0]?.id ?? '',
            }
        })
    }, [categoryOptions])

    const progressOverview = useMemo(() => ({
        total: summary.totalTasks,
        completed: summary.completedTasks,
        percent: summary.averageProgress,
    }), [summary])

    const statusSummary = useMemo(() => ([
        { label: '未着手', count: tasksByStatus.notStarted.length, tone: 'text-gray-500 bg-white/80' },
        { label: '進行中', count: tasksByStatus.inProgress.length, tone: 'text-amber-600 bg-amber-100/70' },
        { label: '完了', count: tasksByStatus.done.length, tone: 'text-emerald-600 bg-emerald-100/70' },
    ]), [tasksByStatus])

    const assigneeOptions = useMemo(() => (
        members.map(member => ({ id: member.id, label: member.name, role: member.role }))
    ), [members])

    const urgencySummary = useMemo(() => ({
        dueSoon: dueSoonTasks.length,
        overdue: overdueTasks.length,
    }), [dueSoonTasks, overdueTasks])

    const dueSoonSet = useMemo(() => new Set(dueSoonTasks.map(task => task.id)), [dueSoonTasks])
    const overdueSet = useMemo(() => new Set(overdueTasks.map(task => task.id)), [overdueTasks])

    const handleTaskSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!newTask.title.trim() || !newTask.categoryId) {
            setTaskError('タスク名とカテゴリを入力してください')
            return
        }

        addTask({
            title: newTask.title.trim(),
            categoryId: newTask.categoryId,
            emoji: newTask.emoji,
            notes: newTask.notes.trim() ? newTask.notes.trim() : undefined,
            due: newTask.due.trim() ? newTask.due : undefined,
            assigneeIds: newTask.assigneeIds,
        })

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
        })

        setCategoryError(null)
        setNewCategory({ name: '', accent: newCategory.accent })
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
    }

    return (
        <>
        <div className='min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 pb-10 pt-8'>
            <div className='mx-auto flex max-w-[92rem] flex-col gap-6 px-6 xl:px-10'>
                <header className='relative rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur'>
                    <div className='absolute right-6 top-6 flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-rose-100 bg-gradient-to-br from-pink-50 to-white/80 text-xs font-semibold text-rose-500 shadow-md'>
                        <span className='text-[10px] uppercase tracking-wide text-rose-300'>Progress</span>
                        <span className='text-xl font-bold text-rose-500'>{progressOverview.percent}%</span>
                        <span className='text-[10px] text-gray-500'>
                            {progressOverview.completed}/{progressOverview.total || 0}
                        </span>
                    </div>
                    <div className='flex flex-col items-center gap-3 text-center'>
                        <h1 className='text-3xl font-extrabold text-rose-500 md:text-4xl'>
                            💐 タスクブーケ 💐
                        </h1>
                        <div className='flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-500 sm:text-sm'>
                            <span>挙式日：2026年5月2日（土）</span>
                            <span>式場：アニヴェルセルみなとみらい</span>
                        </div>
                    </div>
                </header>
                <section className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
                    <div className='rounded-3xl border border-rose-100 bg-white/80 p-4 shadow-sm'>
                        <h3 className='text-sm font-semibold text-rose-500'>ステータス概要</h3>
                        <ul className='mt-3 space-y-1 text-[12px] font-semibold text-gray-600'>
                            {statusSummary.map(item => (
                                <li key={item.label} className={`flex items-center justify-between rounded-2xl px-3 py-1.5 ${item.tone}`}>
                                    <span>{item.label}</span>
                                    <span>{item.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='rounded-3xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm'>
                        <h3 className='text-sm font-semibold text-amber-600'>期限アラート</h3>
                        <div className='mt-3 space-y-2 text-[12px] font-semibold text-amber-700'>
                            <p>まもなく期限: {urgencySummary.dueSoon} 件</p>
                            <p>期限超過: {urgencySummary.overdue} 件</p>
                        </div>
                        <button
                            type='button'
                            onClick={() => setCalendarOpen(true)}
                            className='mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-amber-600 shadow hover:bg-amber-100'
                        >
                            📅 カレンダーを見る
                        </button>
                    </div>
                    <div className='rounded-3xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm md:col-span-2 xl:col-span-2'>
                        <h3 className='text-sm font-semibold text-sky-600'>期限が近いタスク</h3>
                        <ul className='mt-3 space-y-1 text-[12px] text-gray-600'>
                            {dueSoonTasks.length === 0 ? (
                                <li className='rounded-2xl bg-white/70 px-3 py-2 text-gray-400'>期限が近いタスクはありません</li>
                            ) : dueSoonTasks.slice(0, 4).map(task => (
                                <li key={task.id} className='flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2'>
                                    <span className='font-semibold'>{task.title}</span>
                                    <span className='text-[11px] text-sky-500'>期限 {task.due}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start'>
                    <section className='flex-1 rounded-3xl bg-white/75 p-3 shadow-xl backdrop-blur'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                            <h2 className='text-lg font-bold text-rose-500'>🌸 新しいタスクを追加</h2>
                        </div>
                        <form onSubmit={handleTaskSubmit} className='mt-3 grid gap-2 lg:grid-cols-[2fr,1.2fr,1.2fr,1fr,0.8fr,auto] lg:items-end'>
                            <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                <span>タスク名</span>
                                <input
                                    type='text'
                                    value={newTask.title}
                                    onChange={event => setNewTask(state => ({ ...state, title: event.target.value }))}
                                    placeholder='前撮りのスケジュール調整'
                                    className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                            <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                <span>カテゴリ</span>
                                <select
                                    value={newTask.categoryId}
                                    onChange={event => setNewTask(state => ({ ...state, categoryId: event.target.value }))}
                                    disabled={categoryOptions.length === 0}
                                    className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60'
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
                            <div className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                <span>担当メンバー</span>
                                <div className='mt-1 flex flex-wrap gap-1 rounded-lg border border-pink-100 bg-white/90 p-2 shadow-inner'>
                                    {assigneeOptions.length === 0 ? (
                                        <span className='text-[10px] text-gray-400'>チームメンバーを追加してください</span>
                                    ) : assigneeOptions.map(option => {
                                        const checked = newTask.assigneeIds.includes(option.id)
                                        return (
                                            <label key={option.id} className='flex items-center gap-1 rounded-full border border-white/70 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500'>
                                                <input
                                                    type='checkbox'
                                                    checked={checked}
                                                    onChange={() => {
                                                        setNewTask(state => {
                                                            const next = checked
                                                                ? state.assigneeIds.filter(id => id !== option.id)
                                                                : [...state.assigneeIds, option.id]
                                                            return { ...state, assigneeIds: next }
                                                        })
                                                    }}
                                                    className='h-3 w-3 accent-rose-400'
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                            <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                <span>期限</span>
                                <input
                                    type='date'
                                    value={newTask.due}
                                    onChange={event => setNewTask(state => ({ ...state, due: event.target.value }))}
                                    className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                            <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                <span>アイコン</span>
                                <select
                                    value={newTask.emoji}
                                    onChange={event => setNewTask(state => ({ ...state, emoji: event.target.value }))}
                                    className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                >
                                    {emojiPalette.map(emoji => (
                                        <option key={emoji} value={emoji}>
                                            {emoji}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type='submit'
                                className='h-8 rounded-lg bg-rose-400 px-3 text-[11px] font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            >
                                タスク追加 ✨
                            </button>
                            <label className='flex flex-col text-[11px] font-semibold text-gray-500 lg:col-span-6'>
                                <span>ノート</span>
                                <textarea
                                    value={newTask.notes}
                                    onChange={event => setNewTask(state => ({ ...state, notes: event.target.value }))}
                                    placeholder='メモを短く残せます'
                                    rows={2}
                                    className='mt-1 w-full resize-none rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                        </form>
                        {taskError ? (
                            <p className='mt-2 text-xs font-semibold text-rose-500'>{taskError}</p>
                        ) : null}
                    </section>

                    <section className='w-full max-w-xs rounded-3xl bg-white/75 p-3 shadow-xl backdrop-blur lg:max-w-sm xl:max-w-xs'>
                        <h2 className='text-lg font-bold text-rose-500'>🎨 カテゴリ設定</h2>
                        <form onSubmit={handleCategorySubmit} className='mt-2 space-y-1.5'>
                            <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                <span>カテゴリ名</span>
                                <input
                                    type='text'
                                    value={newCategory.name}
                                    onChange={event => setNewCategory(state => ({ ...state, name: event.target.value }))}
                                    placeholder='例: 料理打ち合わせ'
                                    className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                />
                            </label>
                            <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                <span>テーマカラー</span>
                                <select
                                    value={newCategory.accent}
                                    onChange={event => setNewCategory(state => ({ ...state, accent: event.target.value as AccentToken }))}
                                    className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
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
                                className='h-7 w-full rounded-lg bg-rose-400 text-[11px] font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            >
                                カテゴリを追加
                            </button>
                        </form>
                        {categoryError ? (
                            <p className='mt-2 text-xs font-semibold text-rose-500'>{categoryError}</p>
                        ) : null}
                        <div className='mt-5 border-t border-rose-100 pt-4'>
                            <h3 className='text-sm font-semibold text-rose-500'>🤝 チームメンバー</h3>
                            <ul className='mt-2 space-y-2 text-[11px] text-gray-600'>
                                {members.length === 0 ? (
                                    <li className='rounded-2xl bg-white/70 px-3 py-2 text-gray-400'>メンバーがまだいません</li>
                                ) : members.map(member => (
                                    <li key={member.id} className='rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-sm'>
                                        <div className='flex items-center justify-between'>
                                            <span className='font-semibold text-gray-700'>{member.name}</span>
                                            {member.role ? <span className='text-[10px] text-rose-400'>{member.role}</span> : null}
                                        </div>
                                        <div className='mt-1 space-y-1 text-[10px] text-gray-500'>
                                            {member.contactEmail ? <p>📧 {member.contactEmail}</p> : null}
                                            {member.contactLineId ? <p>💬 LINE: {member.contactLineId}</p> : null}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <form onSubmit={handleMemberSubmit} className='mt-3 grid gap-2'>
                                <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                    <span>メンバー名</span>
                                    <input
                                        type='text'
                                        value={newMember.name}
                                        onChange={event => setNewMember(state => ({ ...state, name: event.target.value }))}
                                        placeholder='例: さやか'
                                        className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                    />
                                </label>
                                <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                    <span>役割</span>
                                    <input
                                        type='text'
                                        value={newMember.role}
                                        onChange={event => setNewMember(state => ({ ...state, role: event.target.value }))}
                                        placeholder='例: プランナー'
                                        className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                    />
                                </label>
                                <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                    <span>メール</span>
                                    <input
                                        type='email'
                                        value={newMember.contactEmail}
                                        onChange={event => setNewMember(state => ({ ...state, contactEmail: event.target.value }))}
                                        placeholder='例: planner@example.com'
                                        className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                    />
                                </label>
                                <label className='flex flex-col text-[11px] font-semibold text-gray-500'>
                                    <span>LINE ID</span>
                                    <input
                                        type='text'
                                        value={newMember.contactLineId}
                                        onChange={event => setNewMember(state => ({ ...state, contactLineId: event.target.value }))}
                                        placeholder='例: @planner123'
                                        className='mt-1 w-full rounded-lg border border-pink-100 bg-white/90 px-2 py-1 text-xs shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                    />
                                </label>
                                <button
                                    type='submit'
                                    className='h-7 w-full rounded-lg bg-rose-400 text-[11px] font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                                >
                                    メンバー追加
                                </button>
                            </form>
                            {memberError ? (
                                <p className='mt-2 text-xs font-semibold text-rose-500'>{memberError}</p>
                            ) : null}
                        </div>
                    </section>
                </div>

                <section className='space-y-4'>
                    <h2 className='text-xl font-bold text-rose-500'>🌼 マイタスクリスト</h2>

                    {categoryStats.length > 0 ? (
                        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {categoryStats.map(stat => {
                                const accentStyle = ACCENT_STYLES[stat.category.accent]
                                return (
                                    <div
                                        key={stat.category.id}
                                        className={`rounded-2xl border ${accentStyle.border} bg-white/70 px-4 py-3 text-xs font-semibold text-gray-600 shadow-sm`}
                                    >
                                        <span className='text-rose-500'>{stat.category.name}</span>
                                        <span className='ml-2 text-[11px] text-gray-500'>{stat.total} 件</span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}

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
        <OverlayModal
            isOpen={isCategoryModalOpen}
            onClose={() => setCategoryModalOpen(false)}
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
            onClose={() => setMemberModalOpen(false)}
            title='チームメンバーを追加'
        >
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
                    className='w-full rounded-lg bg-rose-400 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                >
                    メンバーを追加
                </button>
                {memberError ? (
                    <p className='text-xs font-semibold text-rose-500'>{memberError}</p>
                ) : null}
            </form>
        </OverlayModal>
        </>
    )
})

export default Top
