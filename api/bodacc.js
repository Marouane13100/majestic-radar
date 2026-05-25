export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const secteur = req.query.secteur || 'paca';

    const deptMap = {
      'aix':       ['13'],
      'marseille': ['13'],
      'cannes':    ['06'],
      'nice':      ['06'],
      'var':       ['83'],
      'paca':      ['13','06','83','04','05','84'],
    };

    const depts = deptMap[secteur] || deptMap['paca'];
    const deptFilter = depts.map(d => `numerodepartement="${d}"`).join(' OR ');

    const params = new URLSearchParams();
    params.set('where', `(${deptFilter})`);
    params.set('order_by', 'dateparution DESC');
    params.set('limit', '100');
    params.set('select', 'commercant,denomination,ville,cp,familleavis,dateparution,activite,numerodepartement');

    const url = `https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records?${params.toString()}`;

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
