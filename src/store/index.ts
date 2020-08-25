import { RouterStore } from 'mobx-react-router'

export const routerStore = new RouterStore()

export { default as articleStore } from './articleStore'
export { default as folderStore } from './folderStore'
export { default as extraStore } from './extraStore'
