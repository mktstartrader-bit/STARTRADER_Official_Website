# Economic calendar: widget in the page, `/api/calendar` relay as the API option

`economiccalendar.html` embeds **TradingView's official Economic Calendar
widget** (`embed-widget-events.js`) inside the page's glass card. That is
the use TradingView's widget terms permit, so it needs no consent request
and no server-side code. The widget's `locale` is not listed per language:
the site's mount helper (`mountTradingView()` in `assets/js/main.js`) reads
the page's `<html lang>` and maps it to TradingView's locale code, so the
same markup serves every language folder.

The markup the page carries:

```html
<div class="ec-tv" data-tv-widget="events"
     data-tv-config='{"colorTheme":"light","isTransparent":true,"width":"100%","height":780,
                      "importanceFilter":"-1,0,1",
                      "countryFilter":"us,eu,gb,jp,de,fr,it,ca,au,nz,ch,cn,in,br,mx,kr,za,tr,es,hk"}'></div>
```

`mountTradingView()` turns that into TradingView's standard snippet when the
element scrolls near:

```html
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">…</a></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-events.js" async>
  { "colorTheme": "light", "isTransparent": true, "width": "100%", "height": 780, "locale": "en",
    "importanceFilter": "-1,0,1", "countryFilter": "us,eu,gb,…" }
  </script>
</div>
```

On a stack without `main.js`, paste that snippet directly in place of the
`.ec-tv` div. Nothing else on the page depends on it.

---

# `/api/calendar` — the API alternative (only with TradingView's written permission)

The relay below is kept for the case where TradingView authorises direct
use of its events feed for a custom table. It is **not** wired to the page
today.

## Why a relay

TradingView's endpoint answers `403` to browser requests whose `Origin` it
does not whitelist, so the page cannot call it directly. The relay makes the
request server-side with the accepted origin and returns the JSON from the
site's own domain, cached for five minutes at the edge.

## How a page would call it

The custom-table build (git history before 2026-09-10, commit `6b626444`)
made one request on load for the current Monday-to-Monday week and a fixed
country list, then again about two minutes after each release passed so the
actual figure filled in:

```js
fetch('/api/calendar?from=' + from.toISOString() +
      '&to=' + to.toISOString() +
      '&countries=US,EU,GB,JP,DE,FR,IT,CA,AU,NZ,CH,CN,IN,BR,MX,KR,ZA,TR,ES,HK',
  { headers: { 'Accept': 'application/json' } })
```

To test the endpoint on its own:

```
curl "https://<host>/api/calendar?from=2026-09-07T00:00:00.000Z&to=2026-09-14T00:00:00.000Z&countries=US,EU,GB"
```

A successful answer looks like this (one event shown, taken from a live
response on 2026-09-10):

```json
{
  "status": "ok",
  "result": [
    {
      "id": "420442",
      "title": "Treasury Gilt 2030 Auction",
      "country": "GB",
      "indicator": "Calendar",
      "period": "",
      "date": "2026-09-10T09:00:00.000Z",
      "importance": -1,
      "actual": null,
      "forecast": null,
      "previous": 4.358,
      "unit": "%",
      "currency": "GBP",
      "category": "gov"
    }
  ]
}
```

## Contract

```
GET /api/calendar?from=<ISO-8601 Z>&to=<ISO-8601 Z>&countries=<CC,CC,…>
```

| Parameter   | Format                                  | Example                                     |
|-------------|-----------------------------------------|---------------------------------------------|
| `from`      | `YYYY-MM-DDTHH:MM:SS.sssZ` (UTC)        | `2026-09-07T00:00:00.000Z`                  |
| `to`        | same                                    | `2026-09-14T00:00:00.000Z`                  |
| `countries` | comma-separated ISO-3166 alpha-2 codes  | `US,EU,GB,JP,DE,FR,IT,CA,AU,NZ,CH,CN,IN`    |

Anything else returns `400 {"status":"error","message":"bad params"}`.

Upstream request made by the relay:

```
GET https://economic-calendar.tradingview.com/events?from=…&to=…&countries=…
Accept: application/json
Origin: https://www.tradingview.com
```

Response is passed through unchanged. The page reads `result[]` and uses
these fields per event:

| Field         | Used for                                              |
|---------------|-------------------------------------------------------|
| `date`        | release time (ISO, UTC) → local time, day tab, countdown |
| `country`     | flag and country column                                |
| `title`       | event name                                             |
| `indicator`   | secondary line under the title                         |
| `importance`  | `-1` low · `0` medium · `1` high → impact dot          |
| `actual`, `forecast`, `previous`, `unit`, `scale` | the three figure columns |
| `category`    | `holiday` events are shown when "Holidays" is ticked   |

Response headers set by the relay: `Cache-Control: s-maxage=300, stale-while-revalidate=600`.

## Deploying it

`calendar.js` is a Vercel/Node serverless function and runs as-is on Vercel
(that is what `startrader-official.vercel.app` uses). On the WordPress
stack the same thing is a ~30-line PHP endpoint served at the same path,
so the page needs no change:

```php
<?php // /api/calendar/index.php
header('Content-Type: application/json');
$from = $_GET['from'] ?? ''; $to = $_GET['to'] ?? ''; $cc = $_GET['countries'] ?? '';
$iso = '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/';
if (!preg_match($iso, $from) || !preg_match($iso, $to) || !preg_match('/^[A-Z]{2}(,[A-Z]{2})*$/', $cc)) {
  http_response_code(400); echo '{"status":"error","message":"bad params"}'; exit;
}
$key = 'tv_cal_' . md5("$from|$to|$cc");
if ($cached = get_transient($key)) { header('X-Cache: hit'); echo $cached; exit; }
$url = 'https://economic-calendar.tradingview.com/events?from=' . rawurlencode($from)
     . '&to=' . rawurlencode($to) . '&countries=' . rawurlencode($cc);
$res = wp_remote_get($url, ['timeout' => 8, 'headers' => ['Accept' => 'application/json', 'Origin' => 'https://www.tradingview.com']]);
if (is_wp_error($res) || wp_remote_retrieve_response_code($res) !== 200) {
  http_response_code(502); echo '{"status":"error","message":"upstream"}'; exit;
}
$body = wp_remote_retrieve_body($res);
set_transient($key, $body, 300);
header('Cache-Control: public, max-age=300');
echo $body;
```

If the endpoint lives at a different path, change the single `fetch('/api/calendar?…')`
call in the page script.

## Page behaviour

* While the request is in flight the table shows a loading state.
* On success the rows are replaced with live events and the footer line
  credits TradingView.
* If the relay fails, the page keeps a clearly labelled reference schedule
  and retries on the next release countdown.

## Terms

This is the endpoint behind TradingView's own economic-calendar widget, not
a documented public API. Confirm usage with TradingView, or point the relay
at a licensed calendar feed (the page only needs the field mapping above
adjusted).
