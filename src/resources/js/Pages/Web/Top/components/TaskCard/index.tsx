import React, { useEffect, useMemo, useState } from 'react'
import type { AccentStyle, TaskStatus } from '../../hooks'

type TaskCardProps = {
    accentStyle: AccentStyle
    emoji: string
    title: string
    categoryLabel: string
    notes?: string
    due?: string
    status: TaskStatus
    assignees: Array<{ id: string; name: string; role?: string }>
    allMembers: Array<{ id: string; name: string; role?: string }>
    highlight?: 'dueSoon' | 'overdue' | null
    onStatusChange: (nextStatus: TaskStatus) => void
    onAssigneesChange: (ids: string[]) => void
    onRemove: () => void
}

export const TaskCard = React.memo(function TaskCard({
    accentStyle,
    emoji,
    title,
    categoryLabel,
    notes,
    due,
    status,
    assignees,
    allMembers,
    highlight = null,
    onStatusChange,
    onAssigneesChange,
    onRemove,
}: TaskCardProps) {
    const [isAssigning, setAssigning] = useState(false)

    const highlightClass = useMemo(() => {
        if (highlight === 'overdue') {
            return 'ring-2 ring-rose-300'
        }
        if (highlight === 'dueSoon') {
            return 'ring-2 ring-amber-200'
        }
        return ''
    }, [highlight])

    const dueLabel = useMemo(() => {
        if (!due) {
            return null
        }
        const parsed = new Date(due)
        if (Number.isNaN(parsed.getTime())) {
            return due
        }
        return parsed.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
        })
    }, [due])

    const assignedIds = useMemo(() => new Set(assignees.map(member => member.id)), [assignees])

    useEffect(() => {
        if (allMembers.length === 0 && isAssigning) {
            setAssigning(false)
        }
    }, [allMembers.length, isAssigning])

    return (
        <article
            className={`flex items-center gap-3 rounded-xl border ${accentStyle.border} bg-gradient-to-r ${accentStyle.gradientFrom} ${accentStyle.gradientTo} px-3 py-2 text-xs shadow-md transition hover:shadow-lg ${highlightClass}`}
        >
            <div className='flex min-w-0 flex-1 items-start gap-3'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-base shadow-inner'>
                    {emoji}
                </span>
                <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='truncate text-[13px] font-semibold text-gray-700'>{title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-gray-600 shadow ${accentStyle.badge}`}>
                            {categoryLabel}
                        </span>
                        {dueLabel ? (
                            <span className='rounded-full border border-white/70 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-500'>
                                期限 {dueLabel}
                            </span>
                        ) : null}
                        {highlight === 'overdue' ? (
                            <span className='rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-semibold text-white'>期限超過</span>
                        ) : null}
                        {highlight === 'dueSoon' ? (
                            <span className='rounded-full bg-amber-400/80 px-2 py-0.5 text-[10px] font-semibold text-white'>まもなく期限</span>
                        ) : null}
                    </div>
                    {notes ? (
                        <p className='truncate text-[10px] leading-snug text-gray-600'>{notes}</p>
                    ) : null}
                    <div className='flex flex-wrap items-center gap-2 text-[10px] font-semibold text-gray-500'>
                        <label className='flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-2 py-0.5'>
                            <span>進捗</span>
                            <select
                                value={status}
                                onChange={event => onStatusChange(event.target.value as TaskStatus)}
                                className='rounded-md border border-white/70 bg-white px-2 py-0.5 text-[10px] focus:border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-200'
                            >
                                <option value='not_started'>未着手</option>
                                <option value='in_progress'>進行中</option>
                                <option value='done'>完了</option>
                            </select>
                        </label>
                        <div className='flex items-center gap-1'>
                            <span>担当:</span>
                            <div className='flex flex-wrap gap-1'>
                                {assignees.length === 0 ? (
                                    <span className='rounded-full bg-white/60 px-2 py-0.5 text-[10px] text-gray-400'>未設定</span>
                                ) : assignees.map(member => (
                                    <span key={member.id} className='rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-gray-600'>
                                        {member.name}
                                    </span>
                                ))}
                            </div>
                            {allMembers.length > 0 ? (
                                <button
                                    type='button'
                                    onClick={() => setAssigning(value => !value)}
                                    className='rounded-full border border-white/70 bg-white px-2 py-0.5 text-[10px] text-rose-500 shadow-sm transition hover:bg-rose-50'
                                >
                                    変更
                                </button>
                            ) : null}
                        </div>
                    </div>
                    {isAssigning && allMembers.length > 0 ? (
                        <div className='flex flex-wrap gap-1 rounded-lg border border-white/60 bg-white/90 p-2'>
                            {allMembers.map(member => {
                                const checked = assignedIds.has(member.id)
                                return (
                                    <label key={member.id} className='flex items-center gap-1 rounded-full border border-rose-100 px-2 py-0.5 text-[10px] text-gray-600'>
                                        <input
                                            type='checkbox'
                                            checked={checked}
                                            onChange={() => {
                                                const nextIds = checked
                                                    ? assignees.filter(item => item.id !== member.id).map(item => item.id)
                                                    : [...assignees.map(item => item.id), member.id]
                                                onAssigneesChange(nextIds)
                                            }}
                                            className='h-3 w-3 accent-rose-400'
                                        />
                                        <span>{member.name}</span>
                                    </label>
                                )
                            })}
                        </div>
                    ) : null}
                </div>
            </div>
            <button
                type='button'
                aria-label='タスクを削除'
                onClick={onRemove}
                className='flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/80 text-sm text-rose-500 shadow-sm transition hover:bg-white'
            >
                🗑️
            </button>
        </article>
    )
})

export default TaskCard
