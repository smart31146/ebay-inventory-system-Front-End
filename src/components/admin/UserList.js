import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import endpoints from "../../util/apicall";

import { setUsers } from "../../redux/actions/productActions";

export default function UserList() {
    const user = JSON.parse(localStorage.getItem('user'));
    const users = useSelector(state => state.product.users);
    const visible = useSelector(state => state.product.is_visible);

    const dispatch = useDispatch();

    const [changed, setChanged] = useState(false);

    useEffect(() => {
        updateUsers();
    }, []);

    useEffect(() => {
        updateUsers();
    }, [changed, visible]);

    function updateUsers() {
        endpoints.get_userlist().then(res => {
            dispatch(setUsers(res.data));
        })
            .catch(error => {
                console.log(error.res.data);
            })
    }


    function allow_user(id, e) {
        let checked = e.target.checked;

        if(!window.confirm('このユーザーの体系ログインを許可しますか？')) {
            e.target.checked = !checked;
            return;
        }

        let info = {super_id: user.id, user_id: id, allow: e.target.checked};

        endpoints.allow_user(info).then(() => {
            setChanged(!changed);
        })
        .catch(error => {
            setChanged(!changed);
            console.log(error)
        })
    }

    function delete_user(id) {
        if(!window.confirm('削除しますか？'))
            return;

        let info = {
            super_id: user.id, 
            user_id: id
        }

        endpoints.delete_user(info).then(res => {
            setChanged(!changed);
        })
        .catch(error => {
            console.log(error)
        })
    }

    return (
        <div>
            <table style={{ width: '100%', marginTop: 15 }}>
                <thead>
                    <th>No</th>
                    <th>ユーザー名</th>
                    <th>email</th>
                    <th>登録日</th>
                    <th>ログイン承認</th>
                    <th>削除</th>
                </thead>
                <tbody>
                    {
                        users.map((v, i) => (
                            <tr key={i}>
                                <td style={{width: 30}}>{i + 1}</td>
                                <td>{v.username}</td>
                                <td>{v.email}</td>
                                <td>{v.date_joined}</td>
                                <td>
                                    <div className="form-check form-switch">
                                        {
                                            v.is_active? (
                                                <input className="form-check-input" type="checkbox" style={{width: 60, height: 30}} checked id="mySwitch" name="darkmode" value="yes" onChange={(e) => allow_user(v.id, e)} />
                                            ): (
                                                <input className="form-check-input" type="checkbox" style={{width: 60, height: 30}} id="mySwitch" name="darkmode" value="yes" onChange={(e) => allow_user(v.id, e)} />
                                            ) 
                                        }
                                    </div>
                                </td>
                                <td>
                                    <button className="btn btn-danger w-100" onClick={() => delete_user(v.id)}>削除</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}