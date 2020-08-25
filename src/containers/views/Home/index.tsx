import * as React from 'react'
import { Layout } from 'antd'
import { observer } from 'mobx-react'

import Header from '@components/Header'
import FileAndFolder from './FileAndFolder'
import MarkDown from './MarkDown'
import Tabs from './Tabs'
import Btns from './Btns'
import { useRootStore, useOnMount } from '@utils/customHooks'
import CreateFolderAndFile from '@components/CreateFolderAndFile'
import RightClickMenus from '@components/RightClickMenus'

import * as styles from './index.scss'

const { Sider, Content } = Layout

const Home: React.FC = () => {
    const { routerStore } = useRootStore()

    function checkLocalUserInfo() {
        const token = localStorage.getItem('token')
        if (!token) {
            routerStore.history.replace('/login')
        }
    }

    useOnMount(checkLocalUserInfo)

    return (
        <Layout className={styles.container}>
            <Header />
            <Layout className={styles.layout}>
                <Sider width={250} className={styles.sider}>
                    <Btns />
                    <Tabs />
                </Sider>
                <FileAndFolder />
                <Content className={styles.content}>
                    <MarkDown />
                </Content>
            </Layout>
            <CreateFolderAndFile />
            <RightClickMenus />
        </Layout>
    )
}

export default observer(Home)
