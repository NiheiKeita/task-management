import { Meta, StoryObj } from '@storybook/react'
import { Top } from '.'

const meta: Meta<typeof Top> = {
    component: Top,
    tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof meta>

export const Test: Story = {
    play: async () => {
    },
}
