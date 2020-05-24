// @flow
// @jsx h

import elementReady from 'element-ready'
import { h } from 'dom-chef'
import SelectorObserver from 'selector-observer'
import {
    getDashboardPullRequestsStorageKey,
    getStorageSyncValue,
    setStorageSyncValue,
} from '../storage'
import { getCurrentUser } from '../utils'

export const filterStyle = {
    color: '#091E42',
    marginTop: '7px',
}

const classHide = '__refined_bitbucket_hide'

export const classFilter = (id: string) => `__refined_bitbucket_filter_${id}`

export const filterNames = {
    successfulBuilds: 'successfulBuilds',
    allTasksResolved: 'allTasksResolved',
    needsMyApproval: 'needsMyApproval',
}

const filtersHidingSelector = {
    successfulBuilds: 'span.aui-iconfont-error',
    allTasksResolved: 'div.list-stat span.aui-iconfont-editor-task',
    needsMyApproval: 'div.list-stat a.approval-link.approved',
    notMe: 'span.inline-user--name',
}

async function isSavedFilterChecked(actionId) {
    return (
        (await getStorageSyncValue(
            getDashboardPullRequestsStorageKey(actionId)
        )) === 'true'
    )
}

function pullRequestRowWatcher() {
    return new SelectorObserver(
        document.body,
        '#pullrequests tr.iterable-item',
        async () => {
            if (await isSavedFilterChecked(filterNames.successfulBuilds)) {
                hide(
                    filtersHidingSelector.successfulBuilds,
                    filterNames.successfulBuilds
                )
            }
            if (await isSavedFilterChecked(filterNames.allTasksResolved)) {
                hide(
                    filtersHidingSelector.allTasksResolved,
                    filterNames.allTasksResolved
                )
            }
            if (await isSavedFilterChecked(filterNames.needsMyApproval)) {
                hide(
                    filtersHidingSelector.needsMyApproval,
                    filterNames.needsMyApproval,
                    true
                )
            }
        }
    )
}

async function newCheckbox(filterName, notMe) {
    const checked = await isSavedFilterChecked(filterName)
    if (checked) {
        await elementReady('#pullrequests')
        hide(filtersHidingSelector[filterName], filterName, notMe)
        return (
            <input
                name={filterName}
                style={filterStyle}
                type="checkbox"
                checked
            />
        )
    }
    return <input name={filterName} style={filterStyle} type="checkbox" />
}

function performHide(el: HTMLElement, filterName: string) {
    const row = el.closest('tr')
    if (!row) return

    row.classList.add(getDashboardPullRequestsStorageKey(filterName))
    row.classList.add(classHide)
    return row
}

function hide(querySelector: string, filterName: string, notMe = false) {
    const container: HTMLElement = (document.getElementById(
        'pullrequests'
    ): any)

    if (notMe) {
        const meId = getCurrentUser().account_id
        ;[...container.querySelectorAll(filtersHidingSelector.notMe)]
            .filter(el => ($(el).data('user') || {}).account_id === meId)
            .forEach(el => performHide(el, filterName))
    }

    ;(container.querySelectorAll(querySelector) || []).forEach(el =>
        performHide(el, filterName)
    )
}

function show(filterName: string) {
    ;(document.getElementById('pullrequests'): any)
        .querySelectorAll(
            `tr.${getDashboardPullRequestsStorageKey(filterName)}`
        )
        .forEach(el => {
            el.classList.remove(getDashboardPullRequestsStorageKey(filterName))
            el.classList.remove(classHide)
            return el
        })
}

function saveFilter(actionId: string, checked: boolean) {
    return setStorageSyncValue(
        getDashboardPullRequestsStorageKey(actionId),
        checked.toString()
    )
}

async function onFilterSuccessfulBuilds(e) {
    const { checked } = (e.target: any)
    await saveFilter(filterNames.successfulBuilds, checked)
    return checked
        ? hide(
              filtersHidingSelector.successfulBuilds,
              filterNames.successfulBuilds
          )
        : show(filterNames.successfulBuilds)
}

async function onFilterAllTasksResolved(e) {
    const { checked } = (e.target: any)
    await saveFilter(filterNames.allTasksResolved, checked)
    return checked
        ? hide(
              filtersHidingSelector.allTasksResolved,
              filterNames.allTasksResolved
          )
        : show(filterNames.allTasksResolved)
}

async function onFilterNeedsMyApproval(e) {
    const { checked } = (e.target: any)
    await saveFilter(filterNames.needsMyApproval, checked)
    return checked
        ? hide(
              filtersHidingSelector.needsMyApproval,
              filterNames.needsMyApproval,
              true
          )
        : show(filterNames.needsMyApproval)
}

export default async function insertDashboardOverviewFilters() {
    const container = await elementReady(
        'div.filter-container ul.filter-status'
    )

    // Workspaces Tab selected: Official Bitbucket grid filter desactivates the header (their bug)
    const form = document.getElementById('team-filter')

    // eslint-disable-next-line eqeqeq, no-eq-null
    if (form != null) form.remove()

    const filterSuccessfulBuilds = await newCheckbox(
        filterNames.successfulBuilds
    )
    filterSuccessfulBuilds.addEventListener('change', onFilterSuccessfulBuilds)

    const filterAllTasksResolved = await newCheckbox(
        filterNames.allTasksResolved
    )
    filterAllTasksResolved.addEventListener('change', onFilterAllTasksResolved)

    const filterNeedsMyApproval = await newCheckbox(filterNames.needsMyApproval)
    filterNeedsMyApproval.addEventListener('change', onFilterNeedsMyApproval)

    const filterSuccessfulBuildsWrapper = (
        <li>
            <label>
                {filterSuccessfulBuilds}
                Successful builds
            </label>
        </li>
    )

    const filterAllTasksResolvedWrapper = (
        <li>
            <label>
                {filterAllTasksResolved}
                All tasks resolved
            </label>
        </li>
    )

    const filterNeedsMyApprovalWrapper = (
        <li>
            <label>
                {filterNeedsMyApproval}
                Needs my approval
            </label>
        </li>
    )

    container.appendChild(filterSuccessfulBuildsWrapper)
    container.appendChild(filterAllTasksResolvedWrapper)
    container.appendChild(filterNeedsMyApprovalWrapper)

    await pullRequestRowWatcher()
}
