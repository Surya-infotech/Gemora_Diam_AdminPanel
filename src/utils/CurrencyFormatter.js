
export const formatPriceWithCurrency = (price, currency) => {
    if (!price && price !== 0 && price !== '0') return price;

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;

    if (currency) {
        const { currencysymbol, currencyposition, thousandseparator, decimalseparator, decimal } = currency;

        const decimalPlaces = decimal !== undefined && decimal !== null ? parseInt(decimal, 10) : 2;
        let formattedPrice = numPrice.toFixed(decimalPlaces);

        const decSep = decimalseparator || '.';
        if (decSep !== '.') {
            formattedPrice = formattedPrice.replace('.', decSep);
        }

        if (thousandseparator) {
            const parts = formattedPrice.split(decSep);
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandseparator);
            formattedPrice = parts.join(decSep);
        }

        const symbol = currencysymbol || '$';
        const pos = currencyposition || 'left';

        if (pos === "left") return `${symbol}${formattedPrice}`;
        else if (pos === "right") return `${formattedPrice}${symbol}`;
        else if (pos === "left-space") return `${symbol} ${formattedPrice}`;
        else if (pos === "right-space") return `${formattedPrice} ${symbol}`;
        else return `${symbol}${formattedPrice}`;
    }

    return `$${numPrice.toFixed(2)}`;
};

/**
 * Formats tax price - for percentage taxes shows % symbol, for fixed taxes shows currency formatting
 * @param {number|string} price - The price to format
 * @param {string} taxtype - Type of tax ('percentage' or 'fixed')
 * @param {Object} currency - Currency configuration object (only used for fixed taxes)
 * @returns {string} Formatted tax price string
 */
export const formatTaxPrice = (price, taxtype, currency) => {
    if (!price && price !== 0 && price !== '0') return price;

    if (taxtype === "percentage") {
        return `${price}%`;
    } else if (taxtype === "fixed") {
        return formatPriceWithCurrency(price, currency);
    }

    return price;
};

/**
 * Formats plan price - only applies currency formatting to paid plans
 * @param {number|string} price - The price to format
 * @param {Object} currency - Currency configuration object
 * @returns {string} Formatted plan price string
 */
export const formatPlanPrice = (price, currency) => {
    return formatPriceWithCurrency(price, currency);
};

export default formatPriceWithCurrency;
