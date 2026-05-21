export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const secteur = req.query.secteur || 'paca';
    const limit = parseInt(req.query.limit) || 50;

    const dateLimit = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    // Requête simple sans filtre département — filtrage fait côté serveur
    const url = `https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records?where=dateparution%3E%3Ddate'${dateLimit}'&order_by=dateparution%20DESC&limit=100&select=commercant%2Cdenomination%2Cville%2Ccp%2Cfamilleavis%2Cdateparution%2Cactivite`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `BODACC ${response.status}: ${text.slice(0, 300)}` });
    }

    const data = await response.json();

    // Filtrage PACA côté serveur par code postal
    const pacaCodes = ['13', '06', '83', '04', '05', '84'];
    const filtered = (data.results || []).filter(r => {
      const cp = (r.cp || '').toString();
      return pacaCodes.some(code => cp.startsWith(code));
    });

    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({ results: filtered, total_count: filtered.length });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
