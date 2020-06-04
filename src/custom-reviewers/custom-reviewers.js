import elementReady from 'element-ready'
import { h } from 'dom-chef'
import './custom-reviewers.css'
import {
    initSelectedReviewers,
    initRecentReviewers,
    initAuthorReviewers,
    removeReviewerSearchField,
    removeRecentReviewersList,
    removeAuthorReviewersList,
    insertActions,
    insertForm,
} from './ui-renderer'
import { clearReviewersFieldValue } from './data-selectors'
import {
    syncSearchResultsChanges,
    syncAuthorReviewersChanges,
} from './observers'
import { initTypeaheadElement } from './templates/typeahead'

export default async function customReviewersFeature(config) {
    // Sub features
    const { customReviewersTeamsFeature: isTeamsFeatureEnabled } = config

    // Get ready
    const container = await elementReady('#id_reviewers_group')

    // Clean ui
    removeReviewerSearchField()
    removeRecentReviewersList()
    removeAuthorReviewersList()
    clearReviewersFieldValue() // Clear form reviewers value

    // Mount ui
    insertActions(container, isTeamsFeatureEnabled)
    insertForm(container)
    initTypeaheadElement()

    // Init
    await initSelectedReviewers()
    initRecentReviewers()
    initAuthorReviewers()

    // Observers
    syncAuthorReviewersChanges()
    syncSearchResultsChanges()
}
