import test from 'node:test'
import assert from 'node:assert/strict'
import {
    addCategoryToList,
    addTaskToList,
    toggleTaskInList,
    updateTaskStatusInList,
    clearCompletedTasks,
    removeTaskFromList,
} from './hooks'
import type { WeddingCategory, WeddingTask } from './hooks'

const baseCategories: WeddingCategory[] = [
    { id: 'cat-a', name: '前撮り', accent: 'sky' },
    { id: 'cat-b', name: '会場装飾', accent: 'blush' },
]

const baseTasks: WeddingTask[] = [
    {
        id: 'task-1',
        title: '前撮りのスケジュール調整',
        categoryId: 'cat-a',
        emoji: '📸',
        status: 'in_progress',
        isDone: false,
        due: '2026-02-10',
        assigneeIds: ['member-a'],
    },
    {
        id: 'task-2',
        title: '会場装飾の打ち合わせ',
        categoryId: 'cat-b',
        emoji: '🎀',
        status: 'done',
        isDone: true,
        due: '2026-01-20',
        assigneeIds: ['member-b'],
    },
]

test('addCategoryToList appends unique categories and ignores duplicates', () => {
    const added = addCategoryToList(baseCategories, { name: 'ヘアメイク', accent: 'lavender' })
    assert.equal(added.length, 3)
    assert.equal(added[2].name, 'ヘアメイク')

    const duplicated = addCategoryToList(added, { name: '前撮り', accent: 'sunny' })
    assert.equal(duplicated.length, 3)
})

test('addTaskToList appends a task when category exists', () => {
    const appended = addTaskToList(baseTasks, baseCategories, {
        title: '装花リハーサル',
        categoryId: 'cat-b',
        emoji: '🌸',
        notes: undefined,
        due: undefined,
        assigneeIds: [],
    })

    assert.equal(appended.length, 3)
    assert.equal(appended[2].title, '装花リハーサル')
})

test('toggleTaskInList toggles completion and progress', () => {
    const toggled = toggleTaskInList(baseTasks, 'task-1')
    const updated = toggled.find(task => task.id === 'task-1')

    assert.ok(updated)
    assert.equal(updated?.isDone, true)
    assert.equal(updated?.status, 'done')
})

test('updateTaskStatusInList updates task status and completion', () => {
    const updated = updateTaskStatusInList(baseTasks, 'task-1', 'done')
    const target = updated.find(task => task.id === 'task-1')

    assert.ok(target)
    assert.equal(target?.status, 'done')
    assert.equal(target?.isDone, true)
})

test('clearCompletedTasks removes completed tasks only', () => {
    const filtered = clearCompletedTasks(baseTasks)
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].id, 'task-1')
})

test('removeTaskFromList drops the specified task', () => {
    const filtered = removeTaskFromList(baseTasks, 'task-1')
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].id, 'task-2')
})
