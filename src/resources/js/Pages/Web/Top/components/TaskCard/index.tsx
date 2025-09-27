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
            className={`flex items-center gap-2 rounded-lg border ${accentStyle.border} bg-gradient-to-r ${accentStyle.gradientFrom} ${accentStyle.gradientTo} px-2 py-1 text-xs shadow-sm transition hover:shadow-md ${highlightClass} ${status === 'done' ? 'opacity-50 grayscale' : ''}`}
        >
            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-sm shadow-inner'>
                {emoji}
            </span>
            <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-1.5'>
                    <h3 className='truncate text-[11px] font-semibold text-gray-700'>{title}</h3>
                    <span className={`rounded px-1 py-0.5 text-[8px] font-semibold text-gray-600 ${accentStyle.badge}`}>
                        {categoryLabel}
                    </span>
                    {dueLabel ? (
                        <span className='text-[8px] text-gray-500'>
                            {dueLabel}
                        </span>
                    ) : null}
                    <div className='flex items-center gap-0.5 text-[8px] text-gray-500'>
                        {assignees.length === 0 ? (
                            <span className='text-gray-400'>未担当</span>
                        ) : assignees.map(member => (
                            <span key={member.id} className='text-gray-600'>
                                {member.name}
                            </span>
                        ))}
                        {allMembers.length > 0 ? (
                            <button
                                type='button'
                                onClick={() => setAssigning(value => !value)}
                                className='text-[7px] text-rose-500 hover:text-rose-600 underline ml-0.5'
                            >
                                変更
                            </button>
                        ) : null}
                    </div>
                    {highlight === 'overdue' ? (
                        <span className='rounded bg-rose-500 px-1 py-0.5 text-[7px] font-semibold text-white'>超過</span>
                    ) : null}
                    {highlight === 'dueSoon' ? (
                        <span className='rounded bg-amber-400 px-1 py-0.5 text-[7px] font-semibold text-white'>近い</span>
                    ) : null}
                </div>
                {notes && (
                    <p className='truncate text-[8px] leading-tight text-gray-600 mt-0.5'>{notes}</p>
                )}
                {isAssigning && allMembers.length > 0 && (
                    <div className='flex flex-wrap gap-0.5 rounded border border-white/60 bg-white/90 p-1 mt-1'>
                        {allMembers.map(member => {
                            const checked = assignedIds.has(member.id)
                            return (
                                <label key={member.id} className='flex items-center gap-0.5 rounded border border-rose-100 px-1 py-0.5 text-[8px] text-gray-600'>
                                    <input
                                        type='checkbox'
                                        checked={checked}
                                        onChange={() => {
                                            const nextIds = checked
                                                ? assignees.filter(item => item.id !== member.id).map(item => item.id)
                                                : [...assignees.map(item => item.id), member.id]
                                            onAssigneesChange(nextIds)
                                        }}
                                        className='h-2.5 w-2.5 accent-rose-400'
                                    />
                                    <span>{member.name}</span>
                                </label>
                            )
                        })}
                    </div>
                )}
            </div>
            <div className='flex items-center gap-1'>
                <select
                    value={status}
                    onChange={event => onStatusChange(event.target.value as TaskStatus)}
                    className='text-[8px] border-none bg-transparent text-gray-600 focus:outline-none'
                >
                    <option value='not_started'>未着手</option>
                    <option value='in_progress'>進行中</option>
                    <option value='done'>完了</option>
                </select>
                <button
                    type='button'
                    aria-label='タスクを削除'
                    onClick={onRemove}
                    className='text-[10px] text-rose-500 transition hover:text-rose-600'
                >
                    🗑️
                </button>
            </div>
        </article>
    )
})

export default TaskCard
