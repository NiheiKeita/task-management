import React, { useEffect, useMemo, useState } from 'react'
import { TaskCard } from './components/TaskCard'
import { CalendarModal } from './components/CalendarModal'
import { useWeddingTaskBoard, ACCENT_STYLES } from './hooks'
import { useTranslation } from './useTranslation'
import { languageNames, type Language } from './translations'
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
    const { language, setLanguage, t } = useTranslation()
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
        lastUpdated,
        refreshData,
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
    const [isTaskModalOpen, setTaskModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<{ id: string; name: string; role: string; contactEmail: string; contactLineId: string } | null>(null)
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('')

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

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks

        // カテゴリフィルタリング
        if (selectedCategoryFilter) {
            filtered = tasks.filter(task => task.categoryId === selectedCategoryFilter)
        }

        // 期限順で並び替え（期限なし→最後、期限あり→昇順）
        return filtered.sort((a, b) => {
            if (!a.due && !b.due) return 0
            if (!a.due) return 1
            if (!b.due) return -1
            return new Date(a.due).getTime() - new Date(b.due).getTime()
        })
    }, [tasks, selectedCategoryFilter])

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
        setTaskModalOpen(false)
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
            <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-sky-50'>
                <div className='text-center'>
                    <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500'></div>
                    <p className='font-semibold text-rose-500'>{t('loadingData')}</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-sky-50 px-4'>
                <div className='max-w-md text-center'>
                    <div className='mb-4 text-6xl'>⚠️</div>
                    <h2 className='mb-2 text-xl font-bold text-rose-600'>{t('errorOccurred')}</h2>
                    <p className='mb-4 text-gray-600'>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='rounded-lg bg-rose-500 px-4 py-2 text-white transition hover:bg-rose-600'
                    >
                        {t('reloadPage')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
        <div className='min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 pb-4 pt-4 md:pb-10 md:pt-8'>
            <div className='mx-auto flex max-w-[92rem] flex-col gap-3 px-3 md:gap-6 md:px-6 xl:px-10'>
                {/* 枠外の右上ボタン群 */}
                <div className='flex justify-end'>
                    <div className='flex items-center gap-2'>
                        {/* 言語切り替えボタン */}
                        <div className='relative'>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className='flex h-8 w-20 items-center justify-center rounded-lg bg-green-50 px-3 text-[10px] font-semibold leading-none text-green-600 shadow-md transition hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-300 md:w-24'
                            >
                                {Object.entries(languageNames).map(([code, name]) => (
                                    <option key={code} value={code}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* 更新ボタン */}
                        <button
                            type='button'
                            onClick={refreshData}
                            disabled={loading}
                            className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 shadow-md transition hover:bg-blue-100 disabled:opacity-50'
                            title={t('updateData')}
                        >
                            <svg
                                className={`h-4 w-4 text-blue-600 ${loading ? 'animate-spin' : ''}`}
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                            </svg>
                        </button>
                        {/* 最終更新時間 */}
                        {lastUpdated && (
                            <span className='text-[9px] font-medium text-blue-500 md:text-[10px]'>
                                {t('lastUpdated')}: {lastUpdated.toLocaleTimeString(language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : 'ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
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
                </div>

                <header className='mb-4 rounded-3xl bg-white/80 p-4 shadow-xl backdrop-blur md:p-6'>
                    <div className='flex flex-col items-center gap-3 text-center'>
                        <h1 className='text-4xl font-extrabold text-rose-500 md:text-6xl lg:text-7xl' style={{ fontFamily: "'Dancing Script', cursive" }}>
                            💐 {t('title')} 💐
                        </h1>
                        <div className='flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-gray-500 md:gap-4 md:text-xs lg:text-sm'>
                            <span>{t('weddingDate')}</span>
                            <span>{t('venue')}</span>
                        </div>
                    </div>
                </header>
                <div className='mx-auto mb-4 flex w-[90%] items-center gap-2 md:gap-4'>
                    <button
                        type='button'
                        onClick={() => setTaskModalOpen(true)}
                        className='flex flex-[5] items-center justify-center gap-2 rounded-2xl bg-rose-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                    >
                        ✨ {t('addNewTask')}
                    </button>
                    <button
                        type='button'
                        onClick={() => setCalendarOpen(true)}
                        className='inline-flex flex-[3] items-center justify-center gap-1 rounded-full bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-600 shadow hover:bg-amber-100'
                    >
                        📅 カレンダー
                    </button>
                </div>
                <div className='flex flex-col gap-4 md:flex-row md:items-start'>

                    <section className='hidden w-full rounded-3xl bg-white/75 p-3 shadow-xl backdrop-blur md:block md:max-w-xs'>
                        <div className='space-y-3'>
                            <button
                                type='button'
                                onClick={() => setTaskModalOpen(true)}
                                className='flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            >
                                ✨ {t('addNewTask')}
                            </button>

                            <button
                                type='button'
                                onClick={refreshData}
                                disabled={loading}
                                className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50'
                            >
                                <svg
                                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                                </svg>
                                {t('updateData')}
                            </button>

                            <button
                                type='button'
                                onClick={() => setCategoryModalOpen(true)}
                                className='flex w-full items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                            >
                                🎨 {t('addCategory')}
                            </button>

                            <button
                                type='button'
                                onClick={() => setMemberModalOpen(true)}
                                className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-400 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                            >
                                🤝 {t('manageMembers')}
                            </button>
                        </div>
                    </section>
                </div>

                <section className='space-y-2 md:space-y-4'>
                    <div className='flex items-center gap-3'>
                        <h2 className='text-sm font-bold text-rose-500'>🌼 {t('myTaskList')}</h2>
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className='rounded-lg border border-rose-200 bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-200'
                        >
                            <option value=''>すべてのカテゴリ</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.emoji} {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {filteredAndSortedTasks.length === 0 ? (
                        <p className='rounded-3xl border border-dashed border-rose-200 bg-white/80 p-8 text-center text-sm text-gray-500'>
                            {selectedCategoryFilter ? 'このカテゴリにはタスクがありません' : t('noTasksYet')} 🌷
                        </p>
                    ) : (
                        <div className='space-y-3'>
                            {filteredAndSortedTasks.map(task => {
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
                    <h3 className='mb-3 text-sm font-semibold text-gray-700'>現在のメンバー</h3>
                    <ul className='max-h-32 space-y-2 overflow-y-auto text-[12px] text-gray-600'>
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
                                            className='text-[9px] text-blue-500 underline hover:text-blue-600'
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
                                            className='text-[9px] text-rose-500 underline hover:text-rose-600'
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
                    <h3 className='mb-3 text-sm font-semibold text-gray-700'>新しいメンバーを追加</h3>
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
                    <div className='mt-4 border-t pt-4'>
                        <h3 className='mb-3 text-sm font-semibold text-gray-700'>メンバーを編集</h3>
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
                        setTaskModalOpen(true)
                        setMobileMenuOpen(false)
                    }}
                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200'
                >
                    ✨ 新しいタスクを追加
                </button>

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

        {/* タスク追加モーダル */}
        <OverlayModal
            isOpen={isTaskModalOpen}
            onClose={() => {
                setTaskModalOpen(false)
                setTaskError(null)
            }}
            title={t('addNewTask')}
        >
            <form onSubmit={handleTaskSubmit} className='space-y-4 text-[13px]'>
                <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                    <span>{t('taskName')}</span>
                    <input
                        type='text'
                        value={newTask.title}
                        onChange={event => setNewTask(state => ({ ...state, title: event.target.value }))}
                        placeholder={language === 'en' ? 'Pre-wedding photo schedule' : language === 'ko' ? '웨딩 사진 촬영 일정' : '前撮りのスケジュール調整'}
                        className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                    />
                </label>

                <div className='grid grid-cols-2 gap-3'>
                    <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                        <span>{t('category')}</span>
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
                            className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            {categoryOptions.length === 0 ? (
                                <option value=''>{t('addCategory')}</option>
                            ) : (
                                <option value=''>{t('selectCategory')}</option>
                            )}
                            {categoryOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                        <span>{t('assignedMember')}</span>
                        <select
                            value={newTask.assigneeIds[0] || ''}
                            onChange={event => {
                                const selectedId = event.target.value
                                setNewTask(state => ({
                                    ...state,
                                    assigneeIds: selectedId ? [selectedId] : []
                                }))
                            }}
                            className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                        >
                            <option value=''>{t('selectAssignee')}</option>
                            {assigneeOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.label}{option.role ? ` (${option.role})` : ''}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                    <span>{t('dueDate')}</span>
                    <input
                        type='date'
                        value={newTask.due}
                        onChange={event => setNewTask(state => ({ ...state, due: event.target.value }))}
                        className='rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                    />
                </label>

                <label className='flex flex-col gap-1 font-semibold text-gray-600'>
                    <span>{t('notes')}</span>
                    <textarea
                        value={newTask.notes}
                        onChange={event => setNewTask(state => ({ ...state, notes: event.target.value }))}
                        placeholder={t('shortMemo')}
                        rows={3}
                        className='w-full resize-none rounded-lg border border-pink-100 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200'
                    />
                </label>

                <button
                    type='submit'
                    className='w-full rounded-lg bg-rose-400 px-3 py-3 text-sm font-semibold text-white shadow transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200'
                >
                    {t('addTask')} ✨
                </button>

                {taskError ? (
                    <p className='text-xs font-semibold text-rose-500'>{taskError}</p>
                ) : null}
            </form>
        </OverlayModal>
        </>
    )
})

export default Top
