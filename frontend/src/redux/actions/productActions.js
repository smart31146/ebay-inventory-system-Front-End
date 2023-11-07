export const add_item = (product) => {
    return {
        type: 'ADD_ITEM',
        payload: true
    }
}

export const add_order_item = () => {
    return {
        type: 'ADD_ORDER_ITEM',
        payload: true
    }
}

export const updateInformation = (setting) => {
    return {
        type: 'UPDATE_INFORMATION',
        payload: setting
    }
}

export const workerChanged = (worker) => {
    return {
        type: 'WORKER_CHANGED',
        payload: worker
    }
}

export const ebayInfoUpdated = (ebay) => {
    return {
        type: 'EBAY_INFO_UPDATED',
        payload: ebay
    }
}

export const setActivePage = (page) => {
    return {
        type: 'CHANGE_ACTIVE_PAGE',
        payload: page
    }
}

export const setUsers = (data) => {
    return {
        type: 'USER_LIST',
        payload: data
    }
}

export const setDeactiveUsers = (data) => {
    return {
        type: 'DEACTIVE_USER_LIST',
        payload: data
    }
}

export const changeVisible = (flag) => {
    return {
        type: 'CHANGE_VISIBLE',
        payload: flag
    }
}
