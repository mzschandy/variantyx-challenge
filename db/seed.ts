import { ExternalArticle } from '../shared/external-article.ts';
import { query } from './index.ts';

const externalArticles: ExternalArticle[] = [
  { type: 'pubmed', id: '7683628' },
  { type: 'pubmed', id: '18456578' },
  { type: 'pubmed', id: '20021716' },
  { type: 'pubmed', id: '22658665' },
  { type: 'pubmed', id: '22975760' },
  { type: 'pubmed', id: '23891399' },
  { type: 'pubmed', id: '23974870' },
  { type: 'pubmed', id: '25087612' },
  { type: 'pubmed', id: '27171515' },
  { type: 'pubmed', id: '28546993' },
];

//create table articles(id serial primary key, 
// pubmed_id varchar(50) unique not null, 
// type varchar(50) not null, 
// abstract text, 
// created_at timestamp default Now(), 
// updated_at timestamp default Now())

const seed = async () => {
  for (const article of externalArticles) {
    await query(
      `INSERT INTO articles (type, pubmed_id) VALUES ($1, $2) ON CONFLICT (pubmed_id) DO NOTHING`,
      [article.type, article.id]
    );
  }
  console.log('Seeding complete.');
};

seed();