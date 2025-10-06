import type { Meta, StoryObj } from '@storybook/react'
import { Top } from '.'

const meta: Meta<typeof Top> = {
    title: 'Pages/Web/Top',
    component: Top,
    parameters: {
        layout: 'fullscreen',
    },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
