import express from 'express';

const host =  '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});
app.get('/health', (_, res) => res.send('ok'));

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
