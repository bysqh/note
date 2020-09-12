import * as React from 'react'
import { observer } from 'mobx-react'
import {
    EditOutlined,
    SaveOutlined,
    ExclamationCircleOutlined,
    ShareAltOutlined,
    EllipsisOutlined
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { get } from 'lodash'
import { Input, Spin, Tooltip, Dropdown, Menu } from 'antd'

import message from '@components/AntdMessageExt'
import { editArticle } from '@services/api/article'
import { useRootStore } from '@utils/customHooks'
import { sizeof } from '@utils/common'
import * as styles from './index.scss'
import CodeBlock from './CodeBlock'
import Editor from './Editor'
import { setTopArticle } from '@services/api/article'
import { Tabs } from '@store/extraStore'

const TextArea = Input.TextArea

const Article: React.FC = () => {
    const {
        articleStore: {
            articleContent,
            articles,
            currArticleId,
            contentLoading,
            setArticleContent,
            updateArticle,
            getArticles
        },
        extraStore: { currTabId, getNewestFolderAndFile }
    } = useRootStore()

    const [editing, setEditing] = React.useState(false)
    const [content, setContent] = React.useState(articleContent)
    const [title, setTitle] = React.useState('')

    React.useEffect(() => {
        setContent(articleContent)
    }, [articleContent])

    React.useEffect(() => {
        setContent('')
        setArticleContent('')
        setEditing(false)
    }, [currArticleId])

    const article = React.useMemo(() => {
        return articles.find(v => v.id === currArticleId)
    }, [currArticleId, articles])

    // 编辑
    const editTigger = (isEditing?: boolean) => {
        setEditing(!isEditing)
        if (isEditing) {
            save(content, currArticleId)
        } else {
            setContent(content || '')
            setTitle(article.title)
        }
    }

    // 写文章
    const onHandleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value)
    }

    // 保存
    const save = (content: string, currArticleId: string) => {
        if (editing) {
            editArticle({ content, id: currArticleId, title, type: article.type })
            const size = sizeof(content, 'utf-8')
            updateArticle({
                content,
                size,
                id: currArticleId,
                title
            })
        }
    }

    // 标题
    const onHandleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
    }
    // 加载操作项
    const renderBtns = () => {
        const setTop = async () => {
            try {
                const { id, isTop } = article
                const data = { id, is_top: Boolean(isTop) ? 0 : 1 }
                await setTopArticle(data)
                if (Tabs.NewDoc === currTabId) {
                    getNewestFolderAndFile()
                } else {
                    await getArticles(article.parentKey)
                }
                message.success('操作成功')
            } catch {}
        }
        const menu = () => (
            <Menu>
                <Menu.Item onClick={setTop}>{Boolean(article.isTop) ? '取消置顶' : '置顶'}</Menu.Item>
            </Menu>
        )

        return (
            <div className={styles.btns}>
                <span onClick={() => editTigger(editing)}>
                    {editing ? (
                        <Tooltip title="保存">
                            <SaveOutlined style={IconStyle} />
                        </Tooltip>
                    ) : (
                        <Tooltip title="编辑">
                            <EditOutlined style={IconStyle} />
                        </Tooltip>
                    )}
                </span>
                <Tooltip title="分享">
                    <ShareAltOutlined style={IconStyle} />
                </Tooltip>
                <Dropdown overlay={menu()}>
                    <EllipsisOutlined style={IconStyle} />
                </Dropdown>
                <Tooltip title="信息">
                    <ExclamationCircleOutlined style={IconStyle} />
                </Tooltip>
            </div>
        )
    }

    const IconStyle = {
        marginLeft: 8,
        cursor: 'pointer',
        fontSize: 18
    }

    if (!article) {
        return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {editing ? (
                    <Input value={title} onChange={onHandleChangeTitle} style={{ width: 150 }} />
                ) : (
                    <span className={styles.title}>{get(article, 'title')}</span>
                )}
                {!!currArticleId && renderBtns()}
            </div>
            <div className={styles.content}>
                {contentLoading && <Spin className={styles.loading} />}
                {editing ? (
                    <>
                        {article.type === 'article' ? (
                            <Editor
                                defaultValue={content}
                                onChange={v => {
                                    setContent(v)
                                }}
                            />
                        ) : (
                            <TextArea onChange={onHandleInput} value={content} />
                        )}
                    </>
                ) : (
                    <ReactMarkdown
                        source={content}
                        renderers={{
                            code: CodeBlock
                        }}
                        escapeHtml={false}
                    />
                )}
            </div>
        </div>
    )
}

export default observer(Article)
