import { WeddingCategory, WeddingTask, WeddingMember, AddCategoryInput, AddTaskInput, AddMemberInput, UpdateMemberInput, TaskStatus } from './hooks'

const API_BASE_URL = '/api'

// Type mappings between frontend and backend
type BackendCategory = {
    id: number
    name: string
    accent: string
    emoji: string
    created_at: string
    updated_at: string
}

type BackendMember = {
    id: number
    name: string
    role?: string
    created_at: string
    updated_at: string
}

type BackendTask = {
    id: number
    title: string
    category_id: number
    emoji: string
    status: TaskStatus
    is_done: boolean
    due?: string
    notes?: string
    assignee_ids?: number[]
    created_at: string
    updated_at: string
    category: BackendCategory
}

// Transform backend data to frontend format
const transformCategory = (backend: BackendCategory): WeddingCategory => ({
    id: backend.id.toString(),
    name: backend.name,
    accent: backend.accent as any,
    emoji: backend.emoji,
})

const transformMember = (backend: BackendMember): WeddingMember => ({
    id: backend.id.toString(),
    name: backend.name,
    role: backend.role,
})

const transformTask = (backend: BackendTask): WeddingTask => ({
    id: backend.id.toString(),
    title: backend.title,
    categoryId: backend.category_id.toString(),
    emoji: backend.emoji,
    status: backend.status,
    isDone: backend.is_done,
    due: backend.due ? backend.due.split('T')[0] : undefined, // 日付部分のみ抽出
    notes: backend.notes,
    assigneeIds: backend.assignee_ids?.map(id => id.toString()) || [],
})

// API functions
export const api = {
    // Categories
    async getCategories(): Promise<WeddingCategory[]> {
        const response = await fetch(`${API_BASE_URL}/wedding-categories`)
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data: BackendCategory[] = await response.json()
        return data.map(transformCategory)
    },

    async createCategory(input: AddCategoryInput): Promise<WeddingCategory> {
        const response = await fetch(`${API_BASE_URL}/wedding-categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: input.name,
                accent: input.accent,
                emoji: input.emoji,
            }),
        })
        if (!response.ok) throw new Error('Failed to create category')
        const data: BackendCategory = await response.json()
        return transformCategory(data)
    },

    async deleteCategory(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/wedding-categories/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete category')
    },

    // Members
    async getMembers(): Promise<WeddingMember[]> {
        const response = await fetch(`${API_BASE_URL}/wedding-members`)
        if (!response.ok) throw new Error('Failed to fetch members')
        const data: BackendMember[] = await response.json()
        return data.map(transformMember)
    },

    async createMember(input: AddMemberInput): Promise<WeddingMember> {
        const response = await fetch(`${API_BASE_URL}/wedding-members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: input.name,
                role: input.role,
            }),
        })
        if (!response.ok) throw new Error('Failed to create member')
        const data: BackendMember = await response.json()
        return transformMember(data)
    },

    async updateMember(input: UpdateMemberInput): Promise<WeddingMember> {
        const response = await fetch(`${API_BASE_URL}/wedding-members/${input.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: input.name,
                role: input.role,
            }),
        })
        if (!response.ok) throw new Error('Failed to update member')
        const data: BackendMember = await response.json()
        return transformMember(data)
    },

    async deleteMember(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/wedding-members/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete member')
    },

    // Tasks
    async getTasks(): Promise<WeddingTask[]> {
        const response = await fetch(`${API_BASE_URL}/wedding-tasks`)
        if (!response.ok) throw new Error('Failed to fetch tasks')
        const data: BackendTask[] = await response.json()
        return data.map(transformTask)
    },

    async createTask(input: AddTaskInput, categoryEmoji: string): Promise<WeddingTask> {
        const response = await fetch(`${API_BASE_URL}/wedding-tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: input.title,
                category_id: parseInt(input.categoryId),
                emoji: categoryEmoji,
                notes: input.notes,
                due: input.due,
                assignee_ids: input.assigneeIds.map(id => parseInt(id)),
            }),
        })
        if (!response.ok) throw new Error('Failed to create task')
        const data: BackendTask = await response.json()
        return transformTask(data)
    },

    async updateTask(id: string, updates: Partial<{
        status: TaskStatus
        isDone: boolean
        assigneeIds: string[]
    }>): Promise<WeddingTask> {
        const body: any = {}
        if (updates.status !== undefined) {
            body.status = updates.status
            body.is_done = updates.status === 'done'
        }
        if (updates.assigneeIds !== undefined) {
            body.assignee_ids = updates.assigneeIds.map(id => parseInt(id))
        }

        const response = await fetch(`${API_BASE_URL}/wedding-tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (!response.ok) throw new Error('Failed to update task')
        const data: BackendTask = await response.json()
        return transformTask(data)
    },

    async deleteTask(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/wedding-tasks/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete task')
    },
}