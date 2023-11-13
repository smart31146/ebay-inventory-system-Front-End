import endpoints from '../util/apicall';

export default function translate(text){
    endpoints.translate(text).then(response => {
        return response.data;
    }).catch(error => {
        console.log(error);
    })
}