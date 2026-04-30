import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PORT = int(os.environ.get('PORT', '8010'))
PROJECT_ROOT = Path(__file__).resolve().parent
ROOT = PROJECT_ROOT / 'public'
AWESOMEAPI_BASE = 'https://economia.awesomeapi.com.br'
AWESOMEAPI_TOKEN = os.environ.get('AWESOMEAPI_TOKEN', '').strip()


class LocalHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.webmanifest': 'application/manifest+json',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/awesome/market':
            self.handle_awesome_market(parsed)
            return
        super().do_GET()

    def handle_awesome_market(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        requested = params.get('symbols', [''])[0]
        symbols = normalize_symbols(requested)

        if not symbols:
            self.send_json({
                'error': 'Informe ao menos um simbolo. Ex.: USD-BRL,BTC-BRL'
            }, status=400)
            return

        try:
            quotes_payload = fetch_awesome_json(f'/json/last/{",".join(symbols)}')
        except RuntimeError as error:
            self.send_json({
                'error': str(error)
            }, status=502)
            return

        quotes = {}
        errors = {}

        for symbol in symbols:
            key = symbol.replace('-', '')
            quote = quotes_payload.get(key)
            if not isinstance(quote, dict):
                errors[symbol] = 'Cotacao nao encontrada.'
                continue

            normalized = normalize_quote(symbol, quote)

            try:
                daily_rows = fetch_awesome_json(f'/json/daily/{symbol}/30')
                normalized['monthlyPctChange'] = compute_monthly_change(daily_rows)
            except RuntimeError as error:
                normalized['monthlyPctChange'] = None
                errors[symbol] = str(error)

            quotes[symbol] = normalized

        self.send_json({
            'provider': 'awesomeapi',
            'fetchedAt': normalized_now(),
            'quotes': quotes,
            'errors': errors
        })

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def fetch_awesome_json(path):
    url = f'{AWESOMEAPI_BASE}{path}'
    headers = {'User-Agent': 'MeuFinanceiroLocal/1.0'}
    if AWESOMEAPI_TOKEN:
        headers['x-api-key'] = AWESOMEAPI_TOKEN
    request = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        detail = error.read().decode('utf-8', errors='replace').strip()
        raise RuntimeError(f'AwesomeAPI retornou HTTP {error.code}: {detail or error.reason}') from error
    except urllib.error.URLError as error:
        raise RuntimeError(f'Falha ao consultar AwesomeAPI: {error.reason}') from error


def normalize_symbols(raw_symbols):
    items = []
    for piece in str(raw_symbols or '').split(','):
        symbol = piece.strip().upper()
        if not symbol:
            continue
        if '-' not in symbol:
            symbol = f'{symbol}-BRL'
        if symbol not in items:
            items.append(symbol)
    return items


def normalize_quote(symbol, quote):
    return {
        'symbol': symbol,
        'code': str(quote.get('code') or '').upper(),
        'codein': str(quote.get('codein') or '').upper(),
        'name': str(quote.get('name') or symbol),
        'bid': to_float(quote.get('bid')),
        'ask': to_float(quote.get('ask')),
        'high': to_float(quote.get('high')),
        'low': to_float(quote.get('low')),
        'pctChange': to_float(quote.get('pctChange')),
        'varBid': to_float(quote.get('varBid')),
        'timestamp': str(quote.get('timestamp') or ''),
        'createDate': str(quote.get('create_date') or '')
    }


def compute_monthly_change(rows):
    if not isinstance(rows, list):
        return None

    bids = [to_float(row.get('bid')) for row in rows if isinstance(row, dict)]
    bids = [value for value in bids if value > 0]
    if len(bids) < 2:
        return None

    latest = bids[0]
    oldest = bids[-1]
    if oldest <= 0:
        return None

    return round(((latest / oldest) - 1) * 100, 2)


def to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def normalized_now():
    from datetime import datetime
    return datetime.now().isoformat(timespec='seconds')


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', PORT), LocalHandler)
    print(f'Painel local em http://localhost:{PORT}/dinheiro.html')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
