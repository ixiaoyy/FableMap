import assert from 'node:assert/strict'
import fs from 'node:fs'

const editor = fs.readFileSync(new URL('../app/product/WorldBookEditor.jsx', import.meta.url), 'utf8')
const styles = fs.readFileSync(new URL('../app/product/styles.css', import.meta.url), 'utf8')
const pkg = fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')

assert.match(editor, /world-book-loading/, 'WorldBookEditor should render a loading state while hydrating WorldInfo drafts')
assert.match(editor, /role="status"/, 'loading state should be announced as status')
assert.match(editor, /正在加载世界书/, 'loading copy should be user-readable')
assert.match(editor, /Ctrl\/⌘\+S 保存/, 'shortcut hint should tell owners how to save')
assert.match(editor, /event\.ctrlKey \|\| event\.metaKey/, 'keyboard shortcut should support Ctrl and Cmd')
assert.match(editor, /key === 's'/, 'Ctrl/Cmd+S should be handled')
assert.match(editor, /handlePersist\(\)/, 'save shortcut should persist the world book')
assert.match(editor, /key === 'enter'/, 'Ctrl/Cmd+Enter should be handled')
assert.match(editor, /handleTestWorldInfo\(\)/, 'test shortcut should run WorldInfo hit testing')
assert.match(editor, /\[tavern\?\.id, tavern\?\.world_info\]/, 'editor should rehydrate when same-tavern world_info changes')
assert.match(editor, /lastTavernIdRef/, 'editor should distinguish same-tavern world_info refresh from tavern switching')
assert.match(styles, /\.world-book-loading/, 'loading state should have product styling')
assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.world-book-body[\s\S]*flex-direction: column/, 'mobile layout should stack WorldBook body')
assert.match(pkg, /worldbook-editor-test\.mjs/, 'package test script should include WorldBook editor regression test')

console.log('worldbook-editor-test: ok')
