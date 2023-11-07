import { useSelector, useDispatch } from "react-redux";
import UserList from "../components/admin/UserList";
import AllowUser from "../components/admin/AllowUser";

import { changeVisible } from "../redux/actions/productActions";


// import $ from "jquery";
export default function Manage() {
    const visible = useSelector(state => state.product.is_visible);
    const dispatch = useDispatch();

    function toggle(f) {
        dispatch(changeVisible(f));
    }

    return (
        <div className="container-fluid" style={{ paddingTop: 30 }}>
            <div className="d-flex flex-row" style={{ listStyle: 'none', }}>
                <button className={visible ? 'button isactive' : 'button'} style={{ marginRight: 15 }} onClick={() => toggle(true)}>ユーザーリスト</button>
                <button className={visible?'button': 'button isactive'} onClick={() => toggle(false)}>サインアップ承認</button>
            </div>
            <div style={{ width: '100%', display: visible ? 'block' : 'none' }}>
                <UserList />
            </div>
            <div style={{ width: '100%', display: visible ? 'none' : 'block' }}>
                <AllowUser />
            </div>
        </div>
    )
}