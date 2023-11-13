import { combineReducers } from "redux";
import userReucer from "./userReducer";
import productReducer from "./productReducer";

const rootReducer = combineReducers({
    user: userReucer,
    product: productReducer
});

export default rootReducer;