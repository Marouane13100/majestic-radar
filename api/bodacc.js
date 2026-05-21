export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const secteur = req.query.secteur || 'paca';
    const limit = req.query.limit || 50;

    const dateLimit = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    let cpFilter;
    if (secteur === 'aix') {
      cpFilter = `cp like '13*'`;
    } else if (secteur === 'marseille') {
      cpFilter = `cp like '13*'`;
    } else if (secteur === 'cannes' || secteur === 'nice') {
      cpFilter = `cp like '06*'`;
    } else if (secteur === 'var') {
      cpFilter = `cp like '83*'`;
    } else {
      cpFilter = `(cp like '13*' OR cp like '06*' OR cp like '83*' OR cp like '04*' OR cp like '05*')`;
    }

    const where = `dateparution>=date'${dateLimit}' AND ${cpFilter}`;

    const url = `https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records?where=${encodeURIComponent(where)}&order_by=dateparution%20DESC&limit=${limit}&select=commercant,denomination,ville,cp,familleavis,dateparution,activite`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `BODACC ${response.status}: ${text.slice(0,500)}` });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
