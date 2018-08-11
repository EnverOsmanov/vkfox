
class Request {

    /**
     * Convert an object into a query params string
     *
     * @param {Object} params
     *
     * @returns {String}
     */
    static querystring(params: object): string {
        const query = [];

        for (const key in params) {
            if (params[key] === undefined || params[key] === null) {
                continue;
            }
            if (Array.isArray(params[key])) {
                for (let i = 0; i < params[key].length; ++i) {
                    if (params[key][i] === undefined || params[key][i] === null) {
                        continue;
                    }
                    query.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(params[key][i]));
                }
            }
            else query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        return query.join('&');
    }

    static customGet(url: string, params: object): Promise<Response> {
        const urlSearchParams = Request.querystring(params);
        return fetch(url + urlSearchParams);
    }
}

export default Request;