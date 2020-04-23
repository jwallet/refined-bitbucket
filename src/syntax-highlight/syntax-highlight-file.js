/* global Prism, MutationObserver */

'use strict'

import { h } from 'dom-chef'
import elementReady from 'element-ready'
import debounce from '../debounce'
import { getLanguageClass } from './source-handler'

import './prism.css'
import './fix.css'

const codeContainerObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation =>
        syntaxHighlightSourceCodeLines($(mutation.target))
    )
})

let debouncedSideDiffHandler = null

export default async function syntaxHighlightFile() {
    await elementReady('div.view-line')
    const container = await elementReady(
        'div[data-qa="bk-file__content"] .react-monaco-editor-container'
    )
    const header = document.body.querySelector('header h1')

    if (!header || !container) {
        return
    }

    const languageClass = getLanguageClass(header.innerText)
    if (!languageClass) {
        return
    }

    const linesContainer = container.querySelector('div.lines-content')
    linesContainer.classList.add(languageClass)

    const languageBindedByBB = container.getAttribute('data-mode-id')
    if (languageBindedByBB) {
        linesContainer.classList.add(languageBindedByBB)
    }

    syntaxHighlightSourceCodeLines($(linesContainer))

    const codeContainer = linesContainer.querySelector('.view-lines')
    codeContainerObserver.observe(codeContainer, { childList: true })
}

function syntaxHighlightSourceCodeLines($container) {
    const sourceLines = [
        ...$container.find('div.view-line:not([class*=language])'),
    ]

    sourceLines.forEach(preElement => {
        if (!preElement.firstChild.$$rbb_isSyntaxHighlighted) {
            Prism.highlightElement(preElement)
            // eslint-disable-next-line camelcase
            preElement.firstChild.$$rbb_isSyntaxHighlighted = true
        }
    })
}
