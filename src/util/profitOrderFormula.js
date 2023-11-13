export function profitOrderFormula(sell_price_en, purchase_price, prima, shipping, settings) {
    let sell, ship, purchase = 0, profit = 0;
    let rate; 

    sell = sell_price_en;
    ship = shipping;
    purchase = Number(purchase_price) + Number(prima);

    // fvf = settings.fvf !== 0? settings.fvf / 100 : 0;
    // oversea = settings.oversea !== 0? settings.oversea / 100 : 0;
    // payoneer = settings.payoneer !== 0? settings.payoneer / 100 : 0;
    // fedex = settings.fedex !== 0? settings.fedex / 100 : 0;
    rate = settings.rate;
    profit = rate * sell * 0.98 - purchase -ship;
    // profit = sell - sell * fvf - sell * oversea) * (rate - rate * payoneer) - purchase - ship - ship * fedex;
    
    return Number(profit).toFixed(2);
}