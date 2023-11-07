const initialState = {
    settings: {
        email_address: '',
        psw: '',
        variable_price: 1000,
        fvf: 12,
        oversea: 1.35,
        payoneer: 2.0,
        fedex: 20.0,
        rate: 0,
        mercari: '半年以上前'
    },
    ebay: {
        app_id: '',
        dev_id: '',
        cert_id: '',
        ebay_token: '',
        token_expired: ''
    },
    product_changed: false,
    worker: '',
    active_page: {
        '': true,
        'monitor': false,
        'manage': false,
        'delete-list': false,
        'order-list': false,
        'settings': false,
        'register-ebay': false,
    },
    users: [],
    deactive_users: [],
    is_visible: true,
    reload_page: false
}

const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            return {
                ...state,
                product_changed: true
            };

        case 'ADD_ORDER_ITEM':
            return {
                ...state,
                product_changed: true
            }
        case 'UPDATE_INFORMATION':
            return {
                ...state,
                settings: action.payload,
                product_changed: true
            }
        case 'WORKER_CHANGED':
            return {
                ...state,
                worker: action.payload
            }
        case 'EBAY_INFO_UPDATED':
            return {
                ...state,
                ebay: action.payload
            }
        case 'CHANGE_ACTIVE_PAGE':
            return {
                ...state,
                active_page: {
                    '': false,
                    'monitor': false,
                    'manage': false,
                    'delete-list': false,
                    'order-list': false,
                    'settings': false,
                    'register-ebay': false,
                    [action.payload]: true,
                }
            }
        case 'USER_LIST':
            return {
                ...state,
                users: action.payload
            }
        case 'DEACTIVE_USER_LIST':
            return {
                ...state,
                deactive_users: action.payload
            }
        case 'CHANGE_VISIBLE':
            
            return {
                ...state,
                is_visible: action.payload
            }

        default:
            return state;
    }
}

export default productReducer;