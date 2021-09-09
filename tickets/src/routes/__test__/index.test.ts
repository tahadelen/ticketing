import request from 'supertest';
import { app } from '../../app';

it ('can feth a list of tickets', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'title',
            price: 20
        });

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'title',
            price: 21
        });

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);
    
    expect(response.body.length).toEqual(2);
});