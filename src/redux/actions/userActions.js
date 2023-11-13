export const logged = (user) => {
    return {
        type: 'LOG_IN',
        payload: user
    }
}

export const logout = () => {
    return {
        type: 'LOG_OUT'
    }
}

export const register = (user) => {
    return {
        type: 'REGISTER',
    }
}

