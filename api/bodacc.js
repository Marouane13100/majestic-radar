export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { secteur, type, limit = 50 } = req.query;

  const depts = {
    'aix':       '"Bouches-du-Rh%C3%B4ne"',
    'marseille': '"Bouches-du-Rh%C3%B4ne"',
    'cannes':    '"Alpes-Maritimes"',
    'nice':      '"Alpes-Maritimes"',
    'var':       '"Var"',
    'paca':      '"Bouches-du-Rh%C3%B4ne" OR departement_nom_officiel:"Alpes-Maritimes" OR departement_nom_officiel:"Var"',
  };

  const deptFilter = depts[secteur?.toLowerCase()] || depts['paca'];
  const dateLimit  = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  let typeFilter = '';
  if (type === 'liquidation') typeFilter = ' AND familleavis:"Liquidation judiciaire"';
  else if (type === 'redressement') typeFilter = ' AND familleavis:"Redressement judiciaire"';
  else if (type === 'vente') typeFilter = ' AND (familleavis:"Vente" OR familleavis:"Cession")';

  const where = `dateparution >= date'${dateLimit}' AND (departement_nom_officiel:${deptFilter})${typeFilter}`;

  const url = `https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records?` +
    `where=${encodeURIComponent(where)}&order_by=dateparution DESC&limit=${limit}` +
    `&select=commercant,denomination,ville,cp,familleavis,dateparution,activite,departement_nom_officiel`;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`BODACC HTTP ${response.status}`);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 min
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
