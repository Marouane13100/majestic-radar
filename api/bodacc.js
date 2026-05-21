export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const secteur = req.query.secteur || 'paca';
    const limit = req.query.limit || 50;

    const dateLimit = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    let deptFilter;
    if (secteur === 'aix' || secteur === 'marseille') {
      deptFilter = `departement_nom_officiel="Bouches-du-Rhône"`;
    } else if (secteur === 'cannes' || secteur === 'nice') {
      deptFilter = `departement_nom_officiel="Alpes-Maritimes"`;
    } else if (secteur === 'var') {
      deptFilter = `departement_nom_officiel="Var"`;
    } else {
      deptFilter = `(departement_nom_officiel="Bouches-du-Rhône" OR departement_nom_officiel="Alpes-Maritimes" OR departement_nom_officiel="Var")`;
    }

    const where = `dateparution>=date'${dateLimit}' AND ${deptFilter}`;

    const url = `https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records?where=${encodeURIComponent(where)}&order_by=dateparution%20DESC&limit=${limit}&select=commercant,denomination,ville,cp,familleavis,dateparution,activite,departement_nom_officiel`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `BODACC ${response.status}: ${text.slice(0,300)}` });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
