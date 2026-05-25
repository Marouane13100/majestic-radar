export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const secteur = req.query.secteur || 'paca';
    const deptMap = {
      'aix':       '13',
      'marseille': '13',
      'cannes':    '06',
      'nice':      '06',
      'var':       '83',
    };
    const dept = deptMap[secteur];
    const where = dept
      ? `numerodepartement=${dept}`
      : `numerodepartement=13 OR numerodepartement=6 OR numerodepartement=83`;

    const url = `https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records?where=${encodeURIComponent(where)}&order_by=dateparution%20DESC&limit=100&select=commercant,denomination,ville,cp,familleavis,dateparution,activite,numerodepartement`;

    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
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
