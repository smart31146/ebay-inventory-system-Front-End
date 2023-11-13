const initialState = {
    user: {
        id: '',
        is_superuser: false,
        username: false,
        email: '',
        is_staff: false,
        is_active: false,
        app_id: '',
        dev_id: '',
        cert_id: '',
        ebay_token: ''
    },
    loggedIn: false
}

const userReucer = (state = initialState, action) => {
    switch(action.type) {
        case 'LOG_IN':
            return {
                ...state,
                user: action.payload,
                loggedIn: true
            }
        case 'LOG_OUT':
            return {
                ...state,
                user: {},
                loggedIn: false
            }
        default:
            return state;
    }
}

export default userReucer;