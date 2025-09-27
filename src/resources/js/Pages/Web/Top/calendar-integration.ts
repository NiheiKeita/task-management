// カレンダー連携のための機能

export type CalendarEvent = {
    title: string
    description?: string
    startDate: string
    endDate?: string
    location?: string
}

// Google Calendar API設定
const GOOGLE_CALENDAR_CONFIG = {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    apiKey: process.env.GOOGLE_API_KEY || '',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
}

// Google Calendar APIの初期化状態
let isGoogleApiInitialized = false
let isUserSignedIn = false

// Google Calendar APIを初期化
export const initializeGoogleCalendarAPI = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.gapi) {
        console.warn('Google API not available')
        return false
    }

    try {
        await new Promise<void>((resolve) => {
            window.gapi.load('client:auth2', resolve)
        })

        await window.gapi.client.init({
            apiKey: GOOGLE_CALENDAR_CONFIG.apiKey,
            clientId: GOOGLE_CALENDAR_CONFIG.clientId,
            discoveryDocs: [GOOGLE_CALENDAR_CONFIG.discoveryDoc],
            scope: GOOGLE_CALENDAR_CONFIG.scope
        })

        isGoogleApiInitialized = true
        isUserSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get()
        return true
    } catch (error) {
        console.error('Failed to initialize Google Calendar API:', error)
        return false
    }
}

// Google Calendarにサインイン
export const signInToGoogleCalendar = async (): Promise<boolean> => {
    if (!isGoogleApiInitialized) {
        const initialized = await initializeGoogleCalendarAPI()
        if (!initialized) return false
    }

    try {
        const authInstance = window.gapi.auth2.getAuthInstance()
        if (authInstance.isSignedIn.get()) {
            isUserSignedIn = true
            return true
        }

        await authInstance.signIn()
        isUserSignedIn = true
        return true
    } catch (error) {
        console.error('Failed to sign in to Google Calendar:', error)
        return false
    }
}

// Google Calendarからサインアウト
export const signOutFromGoogleCalendar = async (): Promise<void> => {
    if (isGoogleApiInitialized && isUserSignedIn) {
        const authInstance = window.gapi.auth2.getAuthInstance()
        await authInstance.signOut()
        isUserSignedIn = false
    }
}

// Google Calendarにイベントを作成
export const createGoogleCalendarEvent = async (event: CalendarEvent): Promise<boolean> => {
    if (!isGoogleApiInitialized || !isUserSignedIn) {
        const signedIn = await signInToGoogleCalendar()
        if (!signedIn) return false
    }

    try {
        const response = await window.gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: event.title,
                description: event.description,
                start: {
                    date: event.startDate, // 終日イベントとして作成
                },
                end: {
                    date: event.endDate || event.startDate, // 終了日が指定されていない場合は同日
                },
                location: event.location,
            }
        })

        return response.status === 200
    } catch (error) {
        console.error('Failed to create Google Calendar event:', error)
        return false
    }
}

// ブラウザのダウンロード機能でICSファイルを生成（Google Calendar非対応の場合の代替手段）
export const downloadICSFile = (event: CalendarEvent): void => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T09:00:00') // 午前9時を設定
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TaskBouquet//Wedding Task Management//EN',
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(event.startDate)}`,
        `DTEND:${formatDate(event.endDate || event.startDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || ''}`,
        `UID:task-${Date.now()}@taskbouquet.com`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.title.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
}

// カレンダー連携の状態をチェック
export const getCalendarIntegrationStatus = (): {
    isApiAvailable: boolean
    isSignedIn: boolean
} => {
    return {
        isApiAvailable: isGoogleApiInitialized,
        isSignedIn: isUserSignedIn,
    }
}

// タスクからカレンダーイベントを生成
export const createCalendarEventFromTask = (
    taskTitle: string,
    taskDue?: string,
    taskNotes?: string,
    categoryName?: string
): CalendarEvent => {
    const description = [
        taskNotes && `メモ: ${taskNotes}`,
        categoryName && `カテゴリ: ${categoryName}`,
        'Created by タスクブーケ'
    ].filter(Boolean).join('\n')

    return {
        title: `【結婚準備】${taskTitle}`,
        description,
        startDate: taskDue || new Date().toISOString().split('T')[0],
        location: '結婚準備タスク'
    }
}