/* Relays TradingView's economic-calendar API for the calendar page.
   TradingView 403s requests whose Origin it does not whitelist, so the
   browser cannot call it directly — this function fetches with the
   accepted origin and returns the JSON same-origin, cached at the edge. */
module.exports = async (req, res) => {
  const { from = '', to = '', countries = '' } = req.query || {};
  const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  const CC = /^[A-Z]{2}(,[A-Z]{2})*$/;
  if (!ISO.test(from) || !ISO.test(to) || !CC.test(countries)) {
    res.status(400).json({ status: 'error', message: 'bad params' });
    return;
  }
  try {
    const url = 'https://economic-calendar.tradingview.com/events' +
      '?from=' + encodeURIComponent(from) +
      '&to=' + encodeURIComponent(to) +
      '&countries=' + encodeURIComponent(countries);
    const r = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Origin: 'https://www.tradingview.com'
      }
    });
    if (!r.ok) {
      res.status(502).json({ status: 'error', message: 'upstream ' + r.status });
      return;
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ status: 'error', message: 'fetch failed' });
  }
};
