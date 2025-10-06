// Google API SDK の型定義

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void
      client: {
        init: (config: {
          apiKey: string
          clientId: string
          discoveryDocs: string[]
          scope: string
        }) => Promise<void>
        calendar: {
          events: {
            insert: (params: {
              calendarId: string
              resource: {
                summary: string
                description?: string
                start: { date: string }
                end: { date: string }
                location?: string
              }
            }) => Promise<{ status: number }>
          }
        }
      }
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean
          }
          signIn: () => Promise<void>
          signOut: () => Promise<void>
        }
      }
    }
  }
}

export {}