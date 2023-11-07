import axios from 'axios';

// const APIBASEURL = 'http://localhost:8080/api';
const APIBASEURL = 'http://160.251.62.82:8080/api';


if (localStorage.getItem('token') !== null) {
    var api = axios.create({
        baseURL: APIBASEURL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${localStorage.getItem('token')}`
        }
    });

    var file = axios.create({
        baseURL: APIBASEURL,
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Token ${localStorage.getItem('token')}`
        }
    })
}
else {
    api = axios.create({
        baseURL: APIBASEURL
    });
}

const endpoints = {
    // Register
    register: (username, email, password) => api.post('users/register/', {
        username: username,
        email: email,
        password: password
    }),

    // Login
    login: (email, password) => api.post('users/login/', {
        email: email,
        password: password,
    }),

    updateEmailAddress: (data) => api.post('users/update_email/', data),

    updatePassword: (data) => api.post('users/update_password/', data),

    get_userlist: () => api.get('users/get_userlist/'),

    get_deactive_userlist: () => api.get('users/get_deactive_userlist/'),

    allow_user: (info) => api.post('users/allow_user/', info),

    delete_user: (info) => api.post('users/delete_user/', info),

    // Get users
    get_users: () => api.get('users/get_users/'),

    // Get EbayInfo
    getEbayInfo: () => api.get('users/get_ebay_info/'),

    // Update EbayInfo
    updateEbayInfo: (ebayInfo) => api.post('users/update_ebay_info/', ebayInfo),

    // updateEbayInfo: (user_id, ebayInfo) => api.patch(`users/${user_id}/`, ebayInfo),

    // Logout
    logout: () => api.post('users/logout/'),

    // Scrape
    scrape: (url) => api.post('product/scrape_data/', {
        url: url
    }),

    // validate duplicate, validate ebay info, scraping and vailidate ec_site
    validate_product: (info) => api.post('product/validate_product/', {
        product_info: info
    }),

    // Get Item Specific
    get_item_specific: (item_number) => api.post('product/get_item_specific/', {
        item_number: item_number
    }),

    // Add new product
    add_item: (item) => api.post('product/add_item/', item),

    upload_product_file: (info) => file.post('product/upload_product_file/', info),

    // Get products
    get_products: (params) => api.get(`product/get_products/?${params}`),
    get_products_filter: (params) => api.get(`product/get_products_filter/?${params}`),
    // Delete product
    delete_item: (item) => api.post('product/delete_product/', item),

    // Add ordered product
    add_order_item: (item) => api.post('product/add_order_item/', item),

    upload_order_file: (info) => file.post('product/upload_order_file/', info),

    // Get orders
    get_orders: () => api.get('product/get_orders/'),

    // Delete ordered product
    delete_order_item: (item) => api.post('product/delete_order_item/', item),

    // Get worker's results
    get_results: (params) => api.get(`product/get_results/?${params}`),

    // Get deleted items
    get_deleted_items: () => api.get('product/get_deleted_items/'),

    // Get Shipping Fee
    get_shipping_fee: () => api.get('product/shipping_fee/'),

    // Get Settings Attr. FVF, Payoneer,...
    get_settings_attr: () => api.get('product/settings_attr/'),

    // Update Profit Attr
    update_settings_attr: (settings_attr) => api.post('product/update_settings_attr/', {
        settings_attr: settings_attr
    }),

    get_ecsites: () => api.get('product/get_ecsites/'),

    update_ecsites: (sites) => api.post('product/update_ecsites/', {
        ecsites: sites
    }),

    // Download Product List
    download_product: () => api.post('product/download_product/'),

    // update products information
    update_info: () => api.get('product/update_info/')
};

export default endpoints;