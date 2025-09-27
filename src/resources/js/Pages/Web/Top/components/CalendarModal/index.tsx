import React, { useMemo, useState } from 'react'
import type { TaskStatus } from '../../hooks'

type CalendarEvent = {
    id: string
    title: string
    due: string
    status: TaskStatus
    assignees: string[]
}

type CalendarModalProps = {
    isOpen: boolean
    onClose: () => void
    events: CalendarEvent[]
    onDateSelect?: (date: string) => void
    showDateSelection?: boolean
}

const STATUS_BADGE: Record<TaskStatus, string> = {
    not_started: 'bg-gray-200 text-gray-600',
    in_progress: 'bg-amber-200 text-amber-600',
    done: 'bg-emerald-200 text-emerald-600',
}

const addMonths = (base: Date, offset: number) => {
    const clone = new Date(base)
    clone.setMonth(clone.getMonth() + offset)
    return clone
}

const formatDateKey = (date: Date) => date.toISOString().split('T')[0]

const getCalendarDays = (anchor: Date) => {
    const year = anchor.getFullYear()
    const month = anchor.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const firstWeekDay = firstDayOfMonth.getDay()
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(firstDayOfMonth.getDate() - firstWeekDay)

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + index)
        return day
    })
}

export const CalendarModal = ({ isOpen, onClose, events, onDateSelect, showDateSelection = false }: CalendarModalProps) => {
    const [monthOffset, setMonthOffset] = useState(0)

    const today = useMemo(() => new Date(), [])
    const displayDate = useMemo(() => addMonths(today, monthOffset), [today, monthOffset])
    const displayLabel = useMemo(() => (
        `${displayDate.getFullYear()}年 ${displayDate.toLocaleDateString('ja-JP', { month: 'long' })}`
    ), [displayDate])

    const calendarDays = useMemo(() => getCalendarDays(displayDate), [displayDate])

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        events.forEach(event => {
            const key = event.due
            if (!map.has(key)) {
                map.set(key, [])
            }
            map.get(key)?.push(event)
        })

        return map
    }, [events])

    if (!isOpen) {
        return null
    }

    return (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-sm'>
            <div className='relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white p-6 shadow-2xl'>
                <div className='flex items-center justify-between gap-3'>
                    <div>
                        <h2 className='text-xl font-bold text-rose-500'>カレンダー</h2>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={() => setMonthOffset(value => value - 1)}
                            className='rounded-full border border-rose-200 bg-white px-3 py-1 text-sm text-rose-400 hover:bg-rose-50'
                        >
                            ◀︎
                        </button>
                        <span className='text-sm font-semibold text-gray-600'>{displayLabel}</span>
                        <button
                            type='button'
                            onClick={() => setMonthOffset(value => value + 1)}
                            className='rounded-full border border-rose-200 bg-white px-3 py-1 text-sm text-rose-400 hover:bg-rose-50'
                        >
                            ▶︎
                        </button>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        className='flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    >
                        ×
                    </button>
                </div>
                <div className='mt-4 grid grid-cols-7 gap-2 text-[11px] font-semibold'>
                    {[
                        { label: '日', tone: 'text-rose-500' },
                        { label: '月', tone: 'text-gray-500' },
                        { label: '火', tone: 'text-gray-500' },
                        { label: '水', tone: 'text-gray-500' },
                        { label: '木', tone: 'text-gray-500' },
                        { label: '金', tone: 'text-gray-500' },
                        { label: '土', tone: 'text-sky-500' },
                    ].map(({ label, tone }) => (
                        <div key={label} className={`text-center uppercase tracking-wide ${tone}`}>
                            {label}
                        </div>
                    ))}
                </div>
                <div className='mt-2 grid flex-1 grid-cols-7 gap-1 overflow-auto text-[11px] sm:gap-2'>
                    {calendarDays.map(day => {
                        const key = formatDateKey(day)
                        const monthDiff = day.getMonth() - displayDate.getMonth()
                        const isCurrentMonth = monthDiff === 0 || monthDiff === -11 || monthDiff === 11
                        const isToday = formatDateKey(day) === formatDateKey(today)
                        const dayEvents = eventsByDate.get(key) ?? []


                        const handleDateClick = () => {
                            if (showDateSelection && onDateSelect && isCurrentMonth) {
                                onDateSelect(key)
                                onClose()
                            }
                        }

                        return (
                            <div
                                key={key}
                                className={`flex flex-col gap-1 p-1 sm:p-2 ${isCurrentMonth ? 'bg-transparent' : 'bg-transparent text-gray-400'} ${isToday ? 'rounded-lg bg-rose-50 ring-1 ring-rose-200' : ''} ${showDateSelection && isCurrentMonth ? 'cursor-pointer hover:bg-rose-50 hover:rounded-lg' : ''}`}
                                onClick={handleDateClick}
                            >
                                <span
                                    className={`text-right text-xs font-bold ${day.getDay() === 0 ? 'text-rose-500' : day.getDay() === 6 ? 'text-sky-500' : 'text-gray-700'} ${!isCurrentMonth ? 'text-gray-400' : ''}`}
                                >
                                    {day.getDate()}
                                </span>
                                <div className='flex flex-col gap-0.5'>
                                    {dayEvents.map(event => (
                                        <div key={event.id} className='text-[9px] sm:text-[10px]'>
                                            <div className={`inline-block rounded px-1 py-0.5 font-medium ${STATUS_BADGE[event.status]}`}>
                                                {event.title}
                                            </div>
                                            {event.assignees.length > 0 && (
                                                <div className='mt-0.5 text-[8px] text-gray-500'>
                                                    {event.assignees.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default CalendarModal
