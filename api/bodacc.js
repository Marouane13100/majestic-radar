export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const dateLimit = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    const params = new URLSearchParams();
    params.set('where', `dateparution >= date'${dateLimit}'`);
    params.set('order_by', 'dateparution DESC');
    params.set('limit', '100');
    params.set('select', 'commercant,denomination,ville,cp,familleavis,dateparution,activite');

    const url = `https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json'
