import { useState, useEffect, useRef } from 'react';
import Modal from 'react-awesome-modal';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/sortable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateBack, faBook, faClose, faDownload, faFileExport, faLanguage, faPlus, faRefresh, faRemove, faSave, faUpDownLeftRight, faUpload } from '@fortawesome/free-solid-svg-icons';

import endpoints from '../../util/apicall';
import style from './Add.module.css';

const ServerURL = 'http://localhost:8080';


export default function Add() {
  const [state, setState] = useState({
    id: '',
    requestURL: '',
    scrapeError: '',
    resize_image: '',
    title_jp: '',
    title_jp_error: '',
    title_en: '',
    sku: '',
    item_category: '',
    item_number: '',
    price_jp: '',
    price_en: '',
    quantity: 0,
    point: '',
    condition: '',
    condition_desc: '',
    shipping_policy: '',
    location_country: '',
    location_city: '',
    return_policy: '',
    payment_policy: '',
    private_listing: false,
    best_offer: false,
    description_jp: '',
    description_jp_error: '',
    description_en: '',
    volume1: 1,
    volume2: 2,
    volume3: 3,
    value1: 1,
    value2: "",
    value3: "",
    loading_scrape: false,
    loading_title: false,
    loading_description: false,
    loading_item_specific: false,
    loading_add_item: false,
    add_item_error: '',
    get_item_specific_error: '',
    success_add_item: false,
    preview_template: false,
  });
  
  const [warning, setWarning] = useState({
    requestURL: false,
    resize_image: false,
    title_jp: false,
    title_en: false,
    sku: false,
    item_category: false,
    item_specifics: false,
    duplicate_specifics: false,
    item_number: false,
    condition: false,
    price_en: false,
    quantity: false,
    shipping_policy: false,
    location_country: false,
    location_city: false,
    return_policy: false,
    payment_policy: false,
    description_jp: false,
    description_en: false,
    photos: false,
  });

  const [photos, setPhotos] = useState([]);
  const [photoLength, setPhotoLength] = useState(0);
  const [itemSpecificType, setItemSpecificType] = useState([]);
  const [itemSpecificValue, setItemSpecificValue] = useState([]);
  const image_upload = useRef(null);
  const url_ref = useRef(null);
  const title_jp_ref = useRef(null);
  const title_en_ref = useRef(null);
  const sku_ref = useRef(null);
  const item_category_ref =  useRef(null);
  const item_number_ref = useRef(null);
  const condition_ref = useRef(null);
  const description_en_ref = useRef(null);
  const price_en_ref = useRef(null);
  const quantity_ref = useRef(null);
  const shipping_policy_ref = useRef(null);
  const location_country_ref = useRef(null);
  const location_city_ref = useRef(null);
  const return_policy_ref = useRef(null);
  const payment_policy_ref = useRef(null);
  const [disabled, setDisabled] = useState(true);
  const [enableEbay, setEnableEbay] = useState(true);

  useEffect(() => {
    endpoints.getEbayInfo().then((response) => {
      if(response.data['app_id'] === ''){
        setEnableEbay(false);
      }
    }).catch((error)=> {
      console.log(error);
    });
  }, []);

  useEffect(() => {
    $('#sortable').sortable({
      update: function (event, ui) {
        const newOrder = $(this)
        .sortable('toArray', { attribute: 'id' })
        .map((id) => parseInt(id));
        setPhotos((prevPhotos) =>
          prevPhotos.sort((a, b) => newOrder.indexOf(a['id']) - newOrder.indexOf(b['id']))
        );
      },
    });
  }, [photos]);

  const update = e => {
    const target = e.currentTarget;
    if(target.value !== "" || target.value !== 0){
      setWarning({
        ...warning, [target.name]: false
      });
    }
    setState({
      ...state, [target.name]: target.value
    });
  }

  function handleSubmit(){
    if(state['requestURL'] === ''){
      setWarning({
        ...warning, requestURL: true
      });
    }

    if(state['requestURL'] !== ''){
      setState({
        ...state, loading_scrape: true
      });
      endpoints.scrape(state['requestURL']).then(response => {
        setState({
          ...state, loading_scrape: false
        });
        let photos = response.data.photos;
        setPhotoLength(photos.length);
        setPhotos(photos.map((item, index) => ({...item, id: (index + 1)})));

        let descriptions_jp = [];
        let descriptions_en = [];
        let description_jp = '';
        let description_en = '';
        descriptions_jp = response.data.description_jp;
        descriptions_en = response.data.description_en;

        descriptions_jp.map((description) => {
          description_jp += description + '\n';
        });
        descriptions_en.map((description) => {
          description_en += description + '\n';
        });

        setState({
          ...state, 
          title_jp: response.data.title_jp,
          title_en: response.data.title_en,
          sku: state['requestURL'],
          price_jp: response.data.price_jp,
          price_en: response.data.price_en,
          point: response.data.point || state['point'],
          description_jp: description_jp,
          description_en: description_en,
          scrapeError: '',
        });
      }).catch(error => {
        setState({
          ...state, 
          scrapeError: '操作が失敗しました。もう一度お試しください。',
          loading_scrape: false
        });
      });
    }
  }

  function callHandleSubmit(e){
    if(e.which === 13) {
      handleSubmit();
    }
  }

  function removePhoto(e, id){
    setPhotos((photos) => photos.filter(photo => photo['id'] !== id));
  }
  
  function resizePhoto(){
    if(state['resize_image']){
      setPhotos(photos.map((item)=>({...item, width:parseInt(state['resize_image'])})));
    }
    else{
      setWarning({
        ...warning, resize_image: true
      });
    }
  }

  function click_upload_image(){
    image_upload.current.click();
  }

  function upload_image(e){
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let formData = new FormData();
        formData.append('image', file, file.name);
        endpoints.upload_photo(formData).then((response) => {
          const new_photos = [...photos, {
            'url': `${ServerURL}${response.data.path}`,
            'width': img.width,
            'height': img.height,
            'id': photoLength + 1
          }];
          setPhotos(new_photos);
          setPhotoLength(photoLength + 1);
        });
      };
      img.src = e.target.result;
    }
    if(file){
      reader.readAsDataURL(file);
      setWarning({
        ...warning, photos: false
      });
    }
    e.target.value = '';
  }

  function translate_title(){
    if(state['title_jp'] === ''){
      setWarning({
        ...warning, title_jp: true
      });
    }
    if(state['title_jp'] !== ''){
      setState({
        ...state,
        loading_title: true
      });
      endpoints.translate(state['title_jp']).then(response => {
        setState({
          ...state,
          loading_title: false,
          title_en: response.data,
          title_jp_error: ''
        });
      }).catch(error => {
        setState({
          ...state,
          loading_title: false,
          title_jp_error: '操作が失敗しました。もう一度お試しください。'
        });
      });
    }
  }

  function translate_description(){
    if(state['description_jp'] === ''){
      setWarning({
        ...warning, description_jp: true
      });
    }
    else{
      setState({
        ...state,
        loading_description: true
      });
      endpoints.translate(state['description_jp']).then(response => {
        setState({
          ...state, 
          loading_description: false,
          description_en: response.data
        });
      }).catch(error => {
        setState({
          ...state,
          loading_description: false,
          description_jp_error: '操作が失敗しました。もう一度お試しください。'
        });
      });
    }
  }

  function clear_description(){
    setState({
      ...state, description_jp: ''
    });
  }

  function toggleSelectable(e){
    if(e.currentTarget.checked) {
      setDisabled(false);
    }
    else{
      setDisabled(true);
    }
  }

  function change_three_volume(e){
    setState({
      ...state, 
      volume2: +e.target.value + 1,
      volume3: +e.target.value + 2,
      value1:e.target.value
    });
  }

  function getItemSpecific(){
    if(state['item_number'] === ''){
      setWarning({
        ...warning, item_number: true
      });
      return;
    }
    setState({
      ...state,
      loading_item_specific: true
    });
    endpoints.get_item_specific(state['item_number']).then((response)=> {
      setState({
        ...state,
        loading_item_specific: false,
        get_item_specific_error: ''
      });
      let item_specifics = response.data;
      setItemSpecificType([...itemSpecificType, ...item_specifics.map((item) => (item.Name))]);
      setItemSpecificValue([...itemSpecificValue, ...item_specifics.map((item) => (item.Value))]);
    }).catch((error) => {
      alert("error")

      setState({
        ...state,
        loading_item_specific: false,
        get_item_specific_error: '操作が失敗しました。'
      });
    })
  }

  function addItemSpecific(){
    setItemSpecificType([...itemSpecificType, '']);
    setItemSpecificValue([...itemSpecificValue, '']);
  }

  function removeItemSpecific(e, i){
    setItemSpecificType((itemSpecificType) => itemSpecificType.filter((item, index) => index !== i));
    setItemSpecificValue((itemSpecificValue) => itemSpecificValue.filter((item, index) => index !== i));
  }

  function handleChangeType(e, index){
    let temp = [...itemSpecificType];
    temp[index] = e.target.value;
    setItemSpecificType(temp);
  }

  function handleChangeValue(e, index){
    let temp = [...itemSpecificValue];
    temp[index] = e.target.value;
    setItemSpecificValue(temp);
  }

  function sellItem() {
    const duplicateSpecifics = itemSpecificType.filter((item, index) => itemSpecificType.indexOf(item) !== index);
    if(photos.length === 0){
      setWarning({
        ...warning, photos: true
      });
      window.scrollTo({
        top: $('#sortable').scrollTop(),
        behavior: 'smooth'
      })
      return;
    }
    else if(state['title_jp'] === ''){
      setWarning({
        ...warning, title_jp: true
      });
      title_jp_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        title_jp_ref.current.focus();
      }, 1000);
      return;
    }
    else if(state['title_en'] === ''){
      setWarning({
        ...warning, title_en: true
      });
      title_en_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        title_en_ref.current.focus();
      }, 800);
      return;
    }
    else if(state['sku'] === ''){
      setWarning({
        ...warning, sku: true
      });
      sku_ref.current.scrollIntoView({
        behavior: 'smooth',
      });
      setTimeout(() => {
        sku_ref.current.focus();
      }, 1000);
      return;
    }
    else if(state['item_category'] === ''){
      setWarning({
        ...warning, item_category: true
      });
      item_category_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        item_category_ref.current.focus();
      }, 800);
      return;
    }
    else if(itemSpecificType.length === 0 || itemSpecificType.includes('Brand') === false || itemSpecificType.includes('Type') === false){
      setWarning({
        ...warning, item_specifics: true
      });
      window.scrollTo({
        top: $('#item_specific').scrollTop(),
        behavior: 'smooth'
      });
      return;
    }
    else if(duplicateSpecifics !== []){
      setWarning({
        ...warning, duplicate_specifics: true 
      });
      window.scrollTo({
        top: $('#item_specific').scrollTop(),
        behavior: 'smooth'
      });
      return;
    }
    else if(state['condition'] === ''){
      setWarning({
        ...warning, condition: true
      });
      condition_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        condition_ref.current.focus();
      }, 800);
      return;
    }
    else if(state['description_en'] === ''){
      setWarning({
        ...warning, description_en: true
      });
      description_en_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        description_en_ref.current.focus();
      }, 800);
      return;
    }
    else if(state['price_en'] === ''  ){
      setWarning({
        ...warning, price_en: true
      });
      price_en_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        price_en_ref.current.focus();
      }, 800);
      return;
    }
    else if(state['quantity'] <= 0){
      setWarning({
        ...warning, quantity: true
      });
      quantity_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        quantity_ref.current.focus();
      }, 800);
      return;
    }
    else if(state['shipping_policy'] === ''){
      setWarning({
        ...warning, shipping_policy: true
      });
      shipping_policy_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        shipping_policy_ref.current.focus();
      }, 500);
      return;
    }
    else if(state['location_country'] === ''){
      setWarning({
        ...warning, location_country: true
      });
      location_country_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        location_country_ref.current.focus();
      }, 500);
      return;
    }
    else if(state['location_city'] === ''){
      setWarning({
        ...warning, location_city: true
      });
      location_city_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        location_city_ref.current.focus();
      }, 500);
      return;
    }
    else if(state['return_policy'] === ''){
      setWarning({
        ...warning, return_policy: true
      });
      return_policy_ref.current.scrollIntoView({
        behavior: 'smooth'
      });
      setTimeout(() => {
        return_policy_ref.current.focus();
      }, 500);
      return;
    }
    else if(state['payment_policy'] === ''){
      setWarning({
        ...warning, payment_policy: true
      });
      payment_policy_ref.current.focus();
      return;
    }
    else{
      setState({
        ...state, loading_add_item: true
      });
      endpoints.add_item(
        state['title_jp'],
        state['title_en'],
        itemSpecificType,
        itemSpecificValue,
        state['sku'],
        state['item_category'],
        state['condition'],
        state['condition_desc'],
        state['price_en'],
        state['price_jp'],
        state['quantity'],
        state['point'],
        state['location_country'],
        state['location_city'],
        state['shipping_policy'],
        state['return_policy'],
        state['description_jp'],
        state['description_en'],
        photos,
        state['private_listing'],
        state['best_offer']
        ).then(response => {
          setState({
            ...state,
            loading_add_item: false,
            add_item_error: '',
            success_add_item: true
          });
      }).catch(error => {
        setState({
          ...state,
          loading_add_item: false,
          add_item_error: '操作が失敗しました。もう一度お試しください。'
        });
      });
    }
  }

  function gotoProduct(){
    window.location.href = '';
  }
  
  function gotoEbayInfo(){
      window.location.href = '/register-ebay';
  }

  function showPreviewModal(){
    setState({
      ...state,
      preview_template: true
    });
    document.body.style = "overflow: hidden";
  }

  function hidePreviewModal(){
    setState({
      ...state,
      preview_template: false
    });
    document.body.style = "overflow: auto";
  }


  return (
    <div className={style.container_wrapper}>
      <div className={`${style.container} container`}>
        <div className={style.input}>
          <div className={style.row}>
            <input ref={url_ref} className={warning['requestURL'] ? style.warning : ''} type="text" name="requestURL" placeholder="仕入元URLを入力してください。" onChange={update} onKeyUp={callHandleSubmit} />
            <div className={style.scrape_error}>
              {state['scrapeError']}
            </div>
          </div>

          <div className={state['loading_scrape'] ? `${style.row} ${style.scrape_btn} ${style.loading}` : `${style.row} ${style.scrape_btn}`}>
            <button className="btn" onClick={handleSubmit}>
              <FontAwesomeIcon icon={faDownload}/>
              <span>取 得</span>
              <span className= {`${style.dot} ${style.dot1}`}></span>
              <span className={`${style.dot} ${style.dot2}`}></span>
              <span className={`${style.dot} ${style.dot3}`}></span>
            </button>
          </div>
        </div>

        {state['title_jp'] && 
          <div className={`${style.result}`}>
            <div className={`${style.image_reorder} ${style.row}`}>
              <ul id='sortable' className={style.sortable}>
                {photos?.map((photo) => (
                  <li key={photo['id']} id={photo['id']}>
                    <img src={photo['url']} alt={photo['id']} />
                    <div>
                      サイズ: {photo['width']}
                    </div>
                    <FontAwesomeIcon icon={faClose} onClick={(e) => removePhoto(e, photo['id'])}/>
                  </li>
                ))}
              </ul>

              <div className={`${style.control_photo}`}>
                <div className={`${style.resize_image}`}>
                  <button className={`btn`} onClick={resizePhoto}>
                    <FontAwesomeIcon icon={faUpDownLeftRight} />
                    画像サイズ調整 
                  </button>
                  <input type="number" className={warning['resize_image'] ? style.warning : ''} name="resize_image" onChange={update} />
                </div>

                <div className={`${style.upload_image}`}>
                  <button className={`btn`} onClick={click_upload_image}>
                  <FontAwesomeIcon icon={faUpload} />
                    画像手動アップロード 
                  </button>
                  <input type="file" name="upload_image" hidden ref={image_upload} onChange={upload_image}/>
                </div>
              </div>

              <div className={warning['photos'] ? `${style.error} ${style.warning}`: style.error}>
                最低でも1枚の写真が必要です。
              </div>
            </div>

            <div className={state['loading_title'] ? `${style.title_jp} ${style.row} ${style.loading}` : `${style.title_jp} ${style.row}`}>
              <textarea ref={title_jp_ref} className={warning['title_jp'] ? style.warning: ''} type="text" name="title_jp" value={state['title_jp']} placeholder="日本語のタイトル" onChange={update}>

              </textarea>
              <button className={`btn`} onClick={translate_title}>
                <FontAwesomeIcon icon={faLanguage} />
                <span>翻訳</span>
                <span className= {`${style.dot} ${style.dot1}`}></span>
                <span className={`${style.dot} ${style.dot2}`}></span>
                <span className={`${style.dot} ${style.dot3}`}></span>
              </button>
            </div>

            <div className={`${style.row} ${style.title_jp_error}`}>
              {state['title_jp_error']}
            </div>

            <div className={`${style.title_en} ${style.row}`}>
              <textarea ref={title_en_ref} className={warning['title_en'] ? style.warning : ''} type="text" name="title_en" value={state['title_en']} maxLength="80" placeholder="英語のタイトル" onChange={update}>

              </textarea>
            </div>

            <div className={`${style.sku} ${style.row}`}>
              <textarea ref={sku_ref} className={warning['sku'] ? style.warning: ''} type="text" name="sku" value={state['sku']} maxLength="50" placeholder="カスタムラベル" onChange={update}>

              </textarea>
            </div>

            <div className={`${style.item_category} ${style.row}`}>
              <input ref={item_category_ref} className={warning['item_category'] ? style.warning : ''} type='number' name='item_category' placeholder='アイテムカテゴリ' onChange={update} />
            </div>

            <div className={`${style.item_specific} ${style.row}`}>
              <div className={`${style.label}`}>
                  Item Specifics (BrandとTypeは必須フィールドです。)
              </div>

              <div id='item_specific' className={state['loading_item_specific'] ? `${style.item_specific_input} ${style.loading}` : style.item_specific_input}>
                <input ref={item_number_ref} type='number' name='item_number' className={warning['item_number'] ? style.warning : '' } onChange={update} />
                <button className={`btn ${style.get_item_specific}`} onClick={getItemSpecific}>
                  <FontAwesomeIcon icon={faDownload} />
                  <span>取 得</span>
                  <span className= {`${style.dot} ${style.dot1}`}></span>
                  <span className={`${style.dot} ${style.dot2}`}></span>
                  <span className={`${style.dot} ${style.dot3}`}></span>
                </button>

                <button className={`btn`} onClick={addItemSpecific}>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>追 加</span>
                </button>

                <button className={`btn ${style.remove_all}`} onClick={() => {setItemSpecificType([]); setItemSpecificValue([])}}>
                  <FontAwesomeIcon icon={faRemove} />
                  <span>全削除</span>
                </button>
              </div>

              <div className={style.item_specific_error}>
                {state['get_item_specific_error']}
              </div>

              <div className={warning['item_specifics'] ? `${style.error} ${style.warning}`: style.error}>
                BrandとTypeを入力する必要があります。
              </div>

              <div className={warning['duplicate_specifics'] ? `${style.error} ${style.warning}`: style.error}>
                一部のItem Specificが重複しています。
              </div>

              {itemSpecificType.map((item_specific_type, index) => (
                <div key={index}>
                  <div>
                    Item Specific{index + 1}
                  </div>

                  <div className={style.item_specific_category}>
                    <input type='text'  name='item_specific_type' className={(item_specific_type === 'Brand' || item_specific_type === 'Type') && warning['item_specific'] ? style.warning: ''}  value={item_specific_type} onChange={(e) => handleChangeType(e, index)} />
                    <span>:</span>
                    <input type='text'  name='item_specific_value' className={(item_specific_type === 'Brand' || item_specific_type === 'Type') && warning['item_specific'] ? style.warning: ''}  value={itemSpecificValue[index]}  onChange={(e) => handleChangeValue(e, index)} />
                    <button className={`btn`} onClick={(e) => removeItemSpecific(e, index)}>
                      <FontAwesomeIcon icon={faRemove} />
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={`${style.condition} ${style.row}`}>
              <div className={`${style.label}`}>
                コンディション
              </div>

              <select ref={condition_ref} className={warning['condition'] ? style.warning : ''} name="condition" onChange={update}>
                <option value="">-</option>
                <option value="1000">NEW</option>
                <option value="3000">USED</option>
              </select>
            </div>

            <div className={`${style.condition_desc} ${style.row}`}>
              <div className={`${style.label}`}>
                コンディション説明
              </div>
              <textarea name="condition_desc" maxLength="1000" onChange={update}>

              </textarea>
            </div>

            <div className={`${style.templates} ${style.row}`}>
              <div className={`${style.label}`}>
                テンプレート
              </div>

              <ul>
                <li>
                  <input type="radio" name="template" />
                  テンプレート① 
                </li>

                <li>
                  <input type="radio" name="template" />
                  テンプレート②  
                </li>

                <li>
                  <input type="radio" name="template" />
                  テンプレート③
                </li>
              </ul>
            </div>

            <div className={`${style.description} ${style.row}`}>
              <textarea className={warning['description_jp']? style.warning: ''} name="description_jp" value={state['description_jp']} placeholder="商品説明（日本語）" onChange={update}>

              </textarea>

              <div className={state['loading_description'] ? `${style.control_description} ${style.loading}` : `${style.control_description}`}>
                <button className={`btn ${style.clear_description}`} onClick={clear_description}>
                  <FontAwesomeIcon icon={faRefresh} />
                  クリア
                </button>

                <button className={`btn ${style.translate_description}`} onClick={translate_description}>
                  <FontAwesomeIcon icon={faLanguage} />
                  <span>翻訳</span>
                  <span className= {`${style.dot} ${style.dot1}`}></span>
                  <span className={`${style.dot} ${style.dot2}`}></span>
                  <span className={`${style.dot} ${style.dot3}`}></span>
                </button>
              </div>

              <div className={`${style.description_jp_error}`}>
                {state['description_jp_error']}
              </div>

              <textarea ref={description_en_ref} className={warning['description_en']? style.warning: ''} name="description_en" value={state['description_en']} placeholder="商品説明（英語）" onChange={update}>

              </textarea>
            </div>

            <div className={`${style.preview} ${style.row}`}>
              <button className={`btn`} onClick={showPreviewModal}>
                <FontAwesomeIcon icon={faBook} />
                プレビュー
              </button>
            </div>

            <div className={`${style.sell_format} ${style.row}`}>
              <div className={`${style.label}`}>
                販売形式
              </div>

              <select name="sell_format">
                <option value="buyitnow">Buy it Now</option>
              </select>
            </div>

            <div className={`${style.price} ${style.row}`}>
              <div className={`${style.label}`}>
                売価
              </div>

              <div className={`${style.input_price}`}>
                <input ref={price_en_ref} className={warning['price_en'] ? style.warning : ''} type="number" name="price_en" value={state['price_en']} placeholder="1500" min="0.1" onChange={update} />
                <div className={`${style.unit}`}>
                  $
                </div>
              </div>
            </div>

            <div className={`${style.quantity} ${style.row}`}>
              <div className={`${style.label}`}>
                数量
              </div>

              <input ref={quantity_ref} className={warning['quantity'] ? style.warning: ''} type="number" name="quantity" min="1" onChange={update} />
            </div>

            <div className={`${style.best_offer} ${style.row}`}>
              <div className={`${style.label}`}>
                ベストオファー 
              </div>

              <label className={`${style.switch}`}>
                <input type="checkbox" onChange={(e) => (setState({...state, best_offer: e.target.checked}))} />
                <span className={`${style.slider} ${style.round}`}></span>
              </label>                  
            </div>

            <div className={`${style.volume_pricing} ${style.row}`}>
              <div className={`${style.label}`}>
                ボリュームプライシン
              </div>

              <label className={`${style.switch}`}>
                <input type="checkbox" onClick={toggleSelectable}/>
                <span className={`${style.slider} ${style.round}`}></span>
              </label>   
            </div>

            <div className={`${style.control_volume} ${style.row}`}>
              <div className={`${style.two}`}>
                <div className={`${style.label}`}>
                  Buy 2 and Save
                </div>

                <select name="two" disabled={disabled} value={state.value1}  onChange={change_three_volume}>
                {[...Array(80).keys()].map(i => i + state.volume1).map((item, index)=>(
                  <option key={index} value={item}>{item}%</option>
                ))}
                </select>
              </div>

              <div className={`${style.three}`}>
                <div className={`${style.label}`}>
                  Buy 3 and Save<span>(Optional)</span>
                </div>

                <select name="three" disabled={disabled} value={state.value2} onChange={(e)=>setState({...state, volume3:+e.target.value + 1, value2:e.target.value})}>
                  <option value="">-</option>
                  {[...Array(80 - state.volume2 + 1).keys()].map(i => i + state.volume2).map((item, index)=>(
                    <option key={index} value={item}>{item}%</option>
                  ))}
                </select>
              </div>

              <div className={`${style.four}`}>
                <div className={`${style.label}`}>
                  Buy 4 and Save<span>(Optional)</span>
                </div>

                <select name="four" disabled={disabled} value={state.value3} onChange={(e)=>setState({...state, value3:e.target.value})}>
                  <option value="">-</option>
                  {[...Array(80 - state.volume3 + 1).keys()].map(i => i + state.volume3).map((item, index)=>(
                    <option key={index} value={item}>{item}%</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`${style.private_listing} ${style.row}`}>
              <div className={`${style.label}`}>
                Private listing
              </div>

              <label className={`${style.switch}`}>
                <input type="checkbox" onChange={(e) => (setState({...state, private_listing: e.target.checked}))} />
                <span className={`${style.slider} ${style.round}`}></span>
              </label>  
            </div>

            <div className={`${style.shipping_policy} ${style.row}`}>
              <div className={`${style.label}`}>
                発送ポリシー 
              </div>

              <select ref={shipping_policy_ref} className={warning['shipping_policy'] ? style.warning : ''} name="shipping_policy" onChange={update}>
                <option value="">-</option>
                <option value="00.0 ~ 00.5kg【EU含む】">00.0 ~ 00.5kg【EU含む】</option>
                <option value="00.5 ~ 01.0kg【EU含む】">00.5 ~ 01.0kg【EU含む】</option>
                <option value="01.0 ~ 01.5kg【EU含む】">01.0 ~ 01.5kg【EU含む】</option>
                <option value="01.5 ~ 02.0kg【EU含む】">01.5 ~ 02.0kg【EU含む】</option>
                <option value="02.0 ~ 02.5kg【EU含む】">02.0 ~ 02.5kg【EU含む】</option>
                <option value="02.5 ~ 03.0kg【EU含む】">02.5 ~ 03.0kg【EU含む】</option>
                <option value="03.0 ~ 03.5kg【EU含む】">03.0 ~ 03.5kg【EU含む】</option>
                <option value="03.5 ~ 04.0kg【EU含む】">03.5 ~ 04.0kg【EU含む】</option>
                <option value="04.0 ~ 04.5kg【EU含む】">04.0 ~ 04.5kg【EU含む】</option>
                <option value="【FedEx - DHL】00.0 ~ 00.5kg 【30days】【EU含む】">【FedEx - DHL】00.0 ~ 00.5kg 【30days】【EU含む】</option>
                <option value="【FedEx - DHL】00.5 ~ 01.0kg 【5days】【EU含む】">【FedEx - DHL】00.5 ~ 01.0kg 【5days】【EU含む】</option>
                <option value="【US・EU・Mx・Ca・Asia 送料無料】">【US・EU・Mx・Ca・Asia 送料無料】</option>
                <option value="【エコSAL】 5day">【エコSAL】 5day</option>
              </select>
            </div>

            <div className={`${style.location} ${style.row}`}>
              <div className={`${style.country}`}>
                <div className={`${style.label}`}>
                  Country
                </div>

                <select ref={location_country_ref} className={warning['location_country'] ? style.warning : ''} name="location_country" onChange={update}>
                  <option value="">-</option>
                  <option value="JP">JAPAN</option>
                </select>
              </div>

              <div className={`${style.city}`}>
                <div className={`${style.label}`}>
                  City, State
                </div>

                <input ref={location_city_ref} className={warning['location_city'] ? style.warning: ''} type="text" name="location_city" onChange={update} />
              </div>
            </div>

            <div className={`${style.return_policy} ${style.row}`}>
              <div className={`${style.label}`}>
                返品ポリシー
              </div>

              <select ref={return_policy_ref} className={warning['return_policy'] ? style.warning : ''} name="return_policy"  onChange={update}>
                <option value="">-</option>
                <option value="ReturnsAccepted, MoneyBack, Days_60, Seller">ReturnsAccepted,MoneyBack,Days_60,Seller</option>
              </select>
            </div>

            <div className={`${style.payment_policy} ${style.row}`}>
              <div className={`${style.label}`}>
                支払いポリシー
              </div>

              <select ref={payment_policy_ref} className={warning['payment_policy'] ? style.warning : ''} name="payment_policy" onChange={update}>
                <option value="">-</option>
                <option value="payoneer">Payoneer</option>
              </select>
            </div>

            <div className={`${style.row} ${style.add_item_error}`}>
              {state['add_item_error']}
            </div>

            <div className={state['loading_add_item'] ? `${style.save_export} ${style.row} ${style.loading}` : `${style.save_export} ${style.row}`}>
              <button className={`btn`}>
                <FontAwesomeIcon icon={faSave} />
                下書き保存
              </button>
              <button className={`btn ${style.add_item_btn}`} onClick={sellItem}>
                <FontAwesomeIcon icon={faFileExport} />
                <span>出品</span>
                <span className= {`${style.dot} ${style.dot1}`}></span>
                <span className={`${style.dot} ${style.dot2}`}></span>
                <span className={`${style.dot} ${style.dot3}`}></span>
              </button>
            </div>
          </div>
        }
      </div>

      <Modal visible={state['success_add_item']} width="400" height="200" effect="fadeInUp">
        <div className={`${style.success_add_item}`}>
          <div className={`${style.message}`}>
            商品が成果的に出品されました。
          </div>
          <button className='btn' onClick={gotoProduct}>
            <FontAwesomeIcon icon={faArrowRotateBack} />
            商品ページに行く
          </button>
        </div>
      </Modal>

      <Modal visible={state['preview_template']} width="800" height="90%" effect="fadeInUp" onClickAway={hidePreviewModal}>
        <div className={style.preview_template}>
          <div className={style.main1}>
            <h1>Enjoy shopping!</h1>
            {state['description_en'] &&
              <section className={style.product_dec}>
                  <h2>Description</h2>
                  <div vocab="http://schema.org/" typeof="Product">
                    {state['description_en'].split('\n').map((item, index) => (
                      <span key={index}>
                        {item}
                        <br />
                      </span>
                    ))}
                  </div>
              </section>
            }
            <aside>
                <div className={style.hasso}>
                    <h2>Shipping</h2>
                    <p>Shipping method : DHL or FedEx or Japan Post (with tracking number and insurance)<br/></p>
                    <p>*If you live in a remote area, you will have to pay an additional shipping fee.</p>
                    <p><br/></p>
                </div>
                <div className={style.tyuui}>
                    <h2>International Buyers - Please Note:</h2>
                    <p>
                      Import duties, taxes, and charges are not included in the item price or
                      shipping cost. These charges are the buyer's responsibility. Please check with your country's customs
                      office to determine what these additional costs will be prior to bidding or buying.
                    </p>
                    <p>Thank you for your understanding.</p>
                </div>
            </aside>
          </div>

          <button className={`btn ${style.btn}`} onClick={hidePreviewModal}>
            確認
          </button>
        </div>
      </Modal>

      <Modal visible={enableEbay ? false: true} width="400" height="200">
        <div className={style.ebayinfo_warning}>
          <div className={style.message}>
            eBayの情報を確認してください。
          </div>

          <button className={`btn`} onClick={gotoEbayInfo}>
            <FontAwesomeIcon icon={faArrowRotateBack} />
            eBay情報ページに行く
          </button>
        </div>
      </Modal>
    </div>
  )
}
