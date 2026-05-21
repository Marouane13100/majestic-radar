export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const secteur = req.query.secteur || 'paca';
    const limit = req.query.limit || 50;

    const deptMap = {
      'aix':       'Bouches-du-Rhône',
      'marseille': 'Bouches-du-Rhône',
      'cannes':    'Alpes-Maritimes',
      'nice':      'Alpes-Maritimes',
      'var':       'Var',
    };

    const dept = deptMap[secteur];
    const dateLimit = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    let whereClause;
    if (dept) {
      whereClause = `dateparution >= date'${dateLimit}' AND departement_nom_officiel:'${dept}'`;
    } else {
      whereClause = `dateparution >= date'${dateLimit}' AND (departement_nom_officiel:'Bouches-du-Rhône' OR departement_nom_officiel:'Alpes-Maritimes' OR departement_nom_officiel:'Var')`;
    }

    const url = new URL('https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records');
    url.searchParams.set('where', whereClause);
    url.searchParams.set('order_by', 'dateparution DESC');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('select', 'commercant,denomination,ville,cp,familleavis,dateparution,activite,departement_nom_officiel');

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `BODACC error ${response.status}: ${text.slice(0, 200)}` });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
